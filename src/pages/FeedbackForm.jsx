import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFeedback } from '../context/FeedbackContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const FeedbackForm = () => {
    const { formId } = useParams();
    const { fetchPublicForm, submitResponse } = useFeedback();
    const [form, setForm] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadForm = async () => {
            setLoading(true);
            const formData = await fetchPublicForm(formId);
            if (formData) {
                setForm(formData);
            } else {
                setError('Form not found or has been deleted.');
            }
            setLoading(false);
        };
        loadForm();
    }, [formId, fetchPublicForm]);

    const handleInputChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form) return;

        // Validate required fields
        const missing = form.questions.filter(q => q.required && !answers[q.id]);
        if (missing.length > 0) {
            alert(`Please answer all required questions.`);
            return;
        }

        try {
            await submitResponse(formId, answers);
            setSubmitted(true);
        } catch (err) {
            setError('Failed to submit form. Please try again.');
        }
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    }

    if (!form) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Form not found.</div>;
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
                    <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
                    <p className="text-gray-600">Your feedback has been submitted successfully.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-indigo-600 px-8 py-6">
                        <h1 className="text-2xl font-bold text-white">{form.title}</h1>
                        {form.description && <p className="text-indigo-100 mt-2">{form.description}</p>}
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {form.questions?.map((q, index) => (
                            <div key={q.id} className="bg-white">
                                <label className="block text-lg font-medium text-gray-900 mb-2">
                                    {q.label} {q.required && <span className="text-red-500">*</span>}
                                </label>

                                {q.type === 'text' && (
                                    <Input
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                                        placeholder="Your answer"
                                        className="w-full"
                                    />
                                )}

                                {q.type === 'textarea' && (
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        rows="4"
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                                        placeholder="Your answer"
                                    />
                                )}

                                {q.type === 'rating' && (
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleInputChange(q.id, star)}
                                                className={`text-3xl focus:outline-none transition-transform hover:scale-110 ${(answers[q.id] || 0) >= star ? 'text-yellow-400' : 'text-gray-300'
                                                    }`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'multiple_choice' && (
                                    <div className="space-y-2">
                                        {q.options.map((option, idx) => (
                                            <label key={idx} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                <input
                                                    type="radio"
                                                    name={q.id}
                                                    value={option}
                                                    checked={answers[q.id] === option}
                                                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-gray-700">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="pt-6">
                            <Button type="submit" className="w-full py-3 text-lg shadow-md hover:shadow-lg transition-shadow">
                                Submit Feedback
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
