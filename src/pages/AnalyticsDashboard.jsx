import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFeedback } from '../context/FeedbackContext';
import { Button } from '../components/Button';
import { ArrowLeft, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const AnalyticsDashboard = () => {
    const { formId } = useParams();
    const navigate = useNavigate();
    const { fetchPublicForm, fetchFormResponses } = useFeedback();
    const [form, setForm] = useState(null);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const formData = await fetchPublicForm(formId);
            if (formData) {
                setForm(formData);
                const responsesData = await fetchFormResponses(formId);
                setResponses(responsesData);
            }
            setLoading(false);
        };
        loadData();
    }, [formId, fetchPublicForm, fetchFormResponses]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
    if (!form) return <div className="p-8 text-center text-red-500">Form not found.</div>;

    const exportData = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + responses.map(r => JSON.stringify(r.answers)).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `responses_${form.title}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return '';
        return dateValue.toDate ? dateValue.toDate().toLocaleString() : new Date(dateValue).toLocaleString();
    };

    const formatDateOnly = (dateValue) => {
        if (!dateValue) return '';
        return dateValue.toDate ? dateValue.toDate().toLocaleDateString() : new Date(dateValue).toLocaleDateString();
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/admin/dashboard')} className="gap-2">
                        <ArrowLeft size={20} /> Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{form.title} - Analytics</h1>
                        <p className="text-sm text-gray-500">Total Responses: {responses.length}</p>
                    </div>
                </div>
                <Button onClick={exportData} variant="outline" className="gap-2">
                    <Download size={18} /> Export CSV
                </Button>
            </div>

            <div className="grid gap-8">
                {form.questions?.map((q, index) => {
                    if (q.type === 'rating' || q.type === 'multiple_choice') {
                        // Calculate aggregated data
                        const dataMap = {};

                        if (q.type === 'rating') {
                            [1, 2, 3, 4, 5].forEach(r => dataMap[r] = 0);
                        } else {
                            q.options.forEach(o => dataMap[o] = 0);
                        }

                        responses.forEach(r => {
                            const answer = r.answers[q.id];
                            if (answer) { // Should match string or number
                                dataMap[answer] = (dataMap[answer] || 0) + 1;
                            }
                        });

                        const chartData = Object.keys(dataMap).map(key => ({
                            name: key,
                            count: dataMap[key]
                        }));

                        // Calculate Average for Rating
                        let average = 0;
                        if (q.type === 'rating' && responses.length > 0) {
                            const sum = responses.reduce((acc, r) => acc + (Number(r.answers[q.id]) || 0), 0);
                            average = (sum / responses.length).toFixed(1);
                        }

                        return (
                            <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {index + 1}. {q.label}
                                    </h3>
                                    {q.type === 'rating' && (
                                        <div className="bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 font-medium text-sm">
                                            Average: {average} / 5
                                        </div>
                                    )}
                                </div>

                                <div className="h-64 w-full" style={{ minWidth: 0, minHeight: 0 }}>
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={q.type === 'rating' ? `rgba(99, 102, 241, ${0.4 + (index * 0.15)})` : '#6366f1'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        );
                    } else {
                        // For text/textarea, render latest responses
                        return (
                            <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {index + 1}. {q.label}
                                </h3>
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                    {responses.slice(-5).reverse().map((r, i) => (
                                        <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100">
                                            {r.answers[q.id] || <span className="text-gray-400 italic">No answer</span>}
                                            <div className="text-xs text-gray-400 mt-1">
                                                {formatDate(r.submittedAt)}
                                            </div>
                                        </div>
                                    ))}
                                    {responses.length === 0 && <p className="text-gray-500 italic">No responses yet.</p>}
                                </div>
                            </div>
                        )
                    }
                })}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Responses</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                {form.questions?.slice(0, 3).map(q => (
                                    <th key={q.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-xs truncate">
                                        {q.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {responses.slice(-10).reverse().map((r) => (
                                <tr key={r.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDateOnly(r.submittedAt)}
                                    </td>
                                    {form.questions?.slice(0, 3).map(q => (
                                        <td key={q.id} className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                            {r.answers[q.id]?.toString()}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
