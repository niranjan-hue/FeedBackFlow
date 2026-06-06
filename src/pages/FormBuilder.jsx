import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFeedback } from '../context/FeedbackContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Plus, Trash2, Save, ArrowLeft, GripVertical } from 'lucide-react';

export const FormBuilder = () => {
    const navigate = useNavigate();
    const { formId } = useParams();
    const { addForm, updateForm, fetchPublicForm } = useFeedback();
    const { user } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        if (formId) {
            const loadForm = async () => {
                const existingForm = await fetchPublicForm(formId);
                if (existingForm) {
                    setTitle(existingForm.title);
                    setDescription(existingForm.description);
                    setQuestions(existingForm.questions);
                }
            };
            loadForm();
        }
    }, [formId, fetchPublicForm]);

    const addQuestion = (type) => {
        setQuestions([
            ...questions,
            {
                id: Date.now().toString(),
                type,
                label: '',
                required: true,
                options: type === 'multiple_choice' ? ['Option 1'] : [],
            },
        ]);
    };

    const updateQuestion = (id, field, value) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const removeQuestion = (id) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const addOption = (questionId) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return { ...q, options: [...q.options, `Option ${q.options.length + 1}`] };
            }
            return q;
        }));
    };

    const updateOption = (questionId, index, value) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                const newOptions = [...q.options];
                newOptions[index] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const removeOption = (questionId, index) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return { ...q, options: q.options.filter((_, i) => i !== index) };
            }
            return q;
        }));
    };

    const handleSave = async () => {
        if (!title.trim()) return alert('Title is required');
        if (questions.length === 0) return alert('Add at least one question');

        const formData = {
            title,
            description,
            questions,
            active: true,
        };

        try {
            if (formId) {
                await updateForm(formId, formData);
            } else {
                await addForm(formData, user.uid);
            }
            navigate('/admin/dashboard');
        } catch (error) {
            alert('Failed to save form. Please try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/admin/dashboard')} className="gap-2">
                    <ArrowLeft size={20} /> Back
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">{formId ? 'Edit Form' : 'Create New Form'}</h1>
                <Button onClick={handleSave} className="gap-2">
                    <Save size={20} /> Save Form
                </Button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <Input
                    label="Form Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Customer Feedback"
                    required
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter a brief description..."
                    />
                </div>
            </div>

            <div className="space-y-4">
                {questions.map((q, index) => (
                    <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-700 p-1">
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="flex gap-4 mb-4">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Question {index + 1} ({q.type})</label>
                                <Input
                                    value={q.label}
                                    onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                                    placeholder="Enter your question here..."
                                    className="font-medium text-lg border-transparent focus:border-indigo-500 px-0"
                                />
                            </div>
                        </div>

                        {q.type === 'rating' && (
                            <div className="flex gap-1 text-yellow-400">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span key={star} className="text-2xl">★</span>
                                ))}
                            </div>
                        )}

                        {q.type === 'text' && (
                            <div className="bg-gray-50 p-3 rounded text-gray-400 text-sm">
                                Short text answer space
                            </div>
                        )}

                        {q.type === 'textarea' && (
                            <div className="bg-gray-50 p-3 rounded text-gray-400 text-sm h-20">
                                Long text answer space
                            </div>
                        )}

                        {q.type === 'multiple_choice' && (
                            <div className="space-y-2">
                                {q.options.map((option, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full border border-gray-300" />
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => updateOption(q.id, idx, e.target.value)}
                                            className="flex-1 px-2 py-1 border-b border-gray-200 focus:border-indigo-500 focus:outline-none text-sm"
                                            placeholder={`Option ${idx + 1}`}
                                        />
                                        <button onClick={() => removeOption(q.id, idx)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                <Button variant="ghost" size="sm" onClick={() => addOption(q.id)} className="text-indigo-600 text-xs">
                                    + Add Option
                                </Button>
                            </div>
                        )}

                        <div className="mt-4 flex items-center gap-2">
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={q.required}
                                    onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                Required
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" onClick={() => addQuestion('rating')} className="flex flex-col items-center py-4 h-auto gap-2 hover:bg-indigo-50 hover:border-indigo-200">
                    <span className="text-2xl">★</span>
                    Rating
                </Button>
                <Button variant="outline" onClick={() => addQuestion('multiple_choice')} className="flex flex-col items-center py-4 h-auto gap-2 hover:bg-indigo-50 hover:border-indigo-200">
                    <span className="text-2xl">◉</span>
                    Multiple Choice
                </Button>
                <Button variant="outline" onClick={() => addQuestion('text')} className="flex flex-col items-center py-4 h-auto gap-2 hover:bg-indigo-50 hover:border-indigo-200">
                    <span className="text-2xl">Aa</span>
                    Short Text
                </Button>
                <Button variant="outline" onClick={() => addQuestion('textarea')} className="flex flex-col items-center py-4 h-auto gap-2 hover:bg-indigo-50 hover:border-indigo-200">
                    <span className="text-2xl">¶</span>
                    Long Text
                </Button>
            </div>
        </div>
    );
};
