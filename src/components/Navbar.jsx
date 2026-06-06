import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, PlusCircle } from 'lucide-react';

export const Navbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/dashboard" className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                            FeedbackFlow
                        </Link>
                    </div>
                    <div className="flex items-center space-x-6">
                        <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 flex items-center gap-2 font-medium transition-colors">
                            <LayoutDashboard size={18} />
                            <span className="hidden sm:block">Dashboard</span>
                        </Link>
                        <Link to="/create" className="text-gray-600 hover:text-indigo-600 flex items-center gap-2 font-medium transition-colors">
                            <PlusCircle size={18} />
                            <span className="hidden sm:block">Create Form</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-gray-600 hover:text-red-600 flex items-center gap-2 font-medium transition-colors cursor-pointer"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:block">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
