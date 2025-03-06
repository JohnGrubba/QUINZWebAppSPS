'use client';

interface GaugeProps {
    value: number;
    size?: 'small' | 'medium' | 'large';
}

export function Gauge({ value, size = 'medium' }: GaugeProps) {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    const sizeClass = {
        small: 'w-24 h-24',
        medium: 'w-32 h-32',
        large: 'w-40 h-40',
    };

    return (
        <div className={`relative ${sizeClass[size]} flex items-center justify-center`}>
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                    className="text-slate-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
                <circle
                    className="text-blue-500 transition-all duration-300 ease-in-out"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    style={{
                        transformOrigin: 'center',
                        transform: 'rotate(-90deg)',
                    }}
                />
                <text
                    x="50%"
                    y="50%"
                    dy=".3em"
                    textAnchor="middle"
                    className="text-lg font-bold fill-current"
                >
                    {value}%
                </text>
            </svg>
        </div>
    );
}