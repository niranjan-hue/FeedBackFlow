import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = ({ label, className, error, ...props }) => (
    <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <input
            className={twMerge(clsx(
                "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500",
                error && "border-red-500 focus:ring-red-500 focus:border-red-500",
                className
            ))}
            {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
);
