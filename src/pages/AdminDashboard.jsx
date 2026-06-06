import { Link, useNavigate } from 'react-router-dom';
import { useFeedback } from '../context/FeedbackContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { PlusCircle, ExternalLink, BarChart2, Trash2, Copy, FileText, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

export const AdminDashboard = () => {
    const { forms, fetchUserForms, deleteForm } = useFeedback();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [copiedId, setCopiedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formToDelete, setFormToDelete] = useState(null);

    useEffect(() => {
        const loadForms = async () => {
            if (user) {
                await fetchUserForms(user.uid);
                setLoading(false);
            }
        };
        loadForms();
    }, [user, fetchUserForms]);

    const copyLink = (id) => {
        const url = `${window.location.origin}/form/${id}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading forms...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage your feedback forms</p>
                </div>
                <Link to="/admin/create">
                    <Button className="flex items-center gap-2 px-6 py-3">
                        <PlusCircle size={20} />
                        Create New Form
                    </Button>
                </Link>
            </div>

            {forms.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                        <FileText className="h-10 w-10 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900">No forms yet</h3>
                    <p className="text-gray-500 mt-2 mb-6 max-w-sm">Create your first feedback form to start collecting responses from users.</p>
                    <Link to="/admin/create">
                        <Button variant="outline" className="flex items-center gap-2">
                            <PlusCircle size={18} />
                            Create Form
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {forms.map((form) => {
                        return (
                            <div key={form.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1" title={form.title}>
                                            {form.title}
                                        </h3>
                                        <span className={`px-2 py-1 text-xs rounded-full ${form.active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {form.active !== false ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                                        {form.description || 'No description provided.'}
                                    </p>

                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                        <BarChart2 size={16} className="mr-2" />
                                        Responses
                                    </div>

                                    <div className="flex items-center text-sm text-gray-400 mb-4">
                                        <span className="text-xs">Created: {form.createdAt?.toDate ? form.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</span>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                            Shareable Link
                                        </label>
                                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                            <code className="text-xs text-gray-600 truncate flex-1 select-all">
                                                {`${window.location.origin}/form/${form.id}`}
                                            </code>
                                            <button
                                                onClick={() => copyLink(form.id)}
                                                className="text-indigo-600 hover:text-indigo-800 p-1 rounded transition-colors"
                                                title="Copy Link"
                                            >
                                                {copiedId === form.id ? <Check size={16} /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white px-6 py-4 rounded-b-xl flex justify-between items-center gap-2 border-t border-gray-100">
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            onClick={() => navigate(`/admin/analytics/${form.id}`)}
                                            className="text-gray-600 hover:text-indigo-600 text-sm flex items-center gap-2 px-3"
                                        >
                                            <BarChart2 size={16} />
                                            Analytics
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => navigate(`/admin/edit/${form.id}`)}
                                            className="text-gray-600 hover:text-indigo-600 text-sm flex items-center gap-2 px-3"
                                        >
                                            <FileText size={16} />
                                            Edit
                                        </Button>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setFormToDelete(form.id)}
                                            title="Delete Form"
                                            className="text-gray-400 hover:text-red-600 p-2"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {formToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div 
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                        onClick={() => setFormToDelete(null)}
                    ></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200 max-w-md w-full p-6 sm:p-8 transform transition-all flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-5 ring-4 ring-red-50/50">
                            <Trash2 className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete this form?</h3>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            This will permanently remove the form and all of its responses. This action cannot be undone.
                        </p>
                        <div className="flex w-full flex-col-reverse sm:flex-row gap-3">
                            <Button 
                                type="button"
                                variant="outline" 
                                onClick={() => setFormToDelete(null)}
                                className="w-full sm:w-1/2 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="button"
                                className="w-full sm:w-1/2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-colors border border-transparent"
                                onClick={() => {
                                    deleteForm(formToDelete);
                                    setFormToDelete(null);
                                }}
                            >
                                Delete Form
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
