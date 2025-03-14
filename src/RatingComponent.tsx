import React, { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';

interface Props {
    menu: {
        id: string; // Firebase belge ID'si
        ratings: {
            votes: Record<string, number>;
            average: number;
        };
    };
    onRatingChanged: (newRating: number) => void; // Dışarıya puanlama bilgisini aktarmak için
}

const RatingComponent: React.FC<Props> = ({ menu, onRatingChanged }) => {
    const [userRating, setUserRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [isHovering, setIsHovering] = useState(false);

    const userId = localStorage.getItem('userId') || ''; // LocalStorage'den kullanıcı ID'sini al

    useEffect(() => {
        // Kullanıcının daha önce verdiği oyu al
        const initialUserRating = menu.ratings.votes[userId] || 0;
        setUserRating(initialUserRating);
    }, [menu.ratings.votes, userId]);

    const handleRating = useCallback((rating: number) => {
        setUserRating(rating); // Anında arayüzü güncelle
        onRatingChanged(rating);  // Dışarıya aktar
    }, [onRatingChanged]);

    const renderStar = useCallback((starIndex: number) => {
        const displayRating = isHovering ? hoveredRating : userRating;
        const percentage = Math.min(100, Math.max(0, (displayRating - (starIndex - 1)) * 100));

        return (
            <div
                key={starIndex}
                className="relative inline-block cursor-pointer"
                onMouseMove={() => setHoveredRating(starIndex)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => handleRating(starIndex)}
            >
                <div className="relative w-8 h-8">
                    {/* Base star (outline) */}
                    <Star
                        className={`absolute w-8 h-8 transition-colors duration-200 ${percentage > 0 ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                        strokeWidth={1.5}
                    />

                    {/* Filled overlay */}
                    <div
                        className="absolute inset-0 overflow-hidden transition-all duration-200"
                        style={{ width: `${percentage}%` }}
                    >
                        <Star
                            className="w-8 h-8 text-yellow-400 fill-yellow-400"
                            strokeWidth={1.5}
                        />
                    </div>
                </div>
            </div>
        );
    }, [hoveredRating, isHovering, userRating, handleRating]);

    return (
        <div
            className="flex items-center justify-center space-x-1"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((index) => renderStar(index))}
            </div>
            <div className="ml-4 text-sm text-gray-500">
                {menu.ratings.average.toFixed(1)} ({Object.keys(menu.ratings.votes).length})
            </div>
        </div>
    );
};

export default RatingComponent;