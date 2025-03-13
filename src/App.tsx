import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Soup, Utensils, Salad, Coffee, Star } from 'lucide-react';
import originalMenuData from './data.json';

interface MenuItem {
    date: string;
    soup: string;
    main_course: string;
    side_dish: string;
    dessert_drink: string;
    ratings: {
        votes: { [userId: string]: number };
        average: number;
    };
}

function App() {
    const [menuData, setMenuData] = useState<any>(() => {
        const storedMenuData = localStorage.getItem('menuData');
        if (storedMenuData) {
            return JSON.parse(storedMenuData);
        } else {
            return originalMenuData;
        }
    });
    const [currentDate, setCurrentDate] = useState<string>("");
    const [currentMenu, setCurrentMenu] = useState<MenuItem | null>(null);
    const [menuIndex, setMenuIndex] = useState(0);
    const [userRating, setUserRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('userId')) {
            localStorage.setItem('userId', Math.random().toString(36).substring(2));
        }
        setMenuIndex(menuData.menus.length - 1);
    }, []);

    useEffect(() => {
        if (menuIndex >= 0 && menuIndex < menuData.menus.length) {
            const menu = menuData.menus[menuIndex];
            setCurrentMenu(menu);
            setCurrentDate(menu.date);

            const userId = localStorage.getItem('userId') || '';
            setUserRating(menu.ratings.votes[userId] || 0);
        }
    }, [menuIndex, menuData]);

    const handlePrevious = () => {
        if (menuIndex > 0) {
            setMenuIndex(menuIndex - 1);
        }
    };

    const handleNext = () => {
        if (menuIndex < menuData.menus.length - 1) {
            setMenuIndex(menuIndex + 1);
        }
    };

    const handleRating = (rating: number) => {
        if (!currentMenu) return;

        const userId = localStorage.getItem('userId') || '';

        const updatedMenus = menuData.menus.map((menu, index) => {
            if (index === menuIndex) {
                const updatedVotes = { ...menu.ratings.votes, [userId]: rating };
                const votesArray = Object.values(updatedVotes);
                const newAverage = votesArray.length > 0
                    ? votesArray.reduce((a, b) => a + b, 0) / votesArray.length
                    : 0;

                return {
                    ...menu,
                    ratings: {
                        votes: updatedVotes,
                        average: Number(newAverage.toFixed(1))
                    }
                };
            }
            return menu;
        });

        const updatedMenuData = { ...menuData, menus: updatedMenus };
        setMenuData(updatedMenuData);

        localStorage.setItem('menuData', JSON.stringify(updatedMenuData));
        setUserRating(rating);
    };

    const handleStarHover = (event: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const rating = x < rect.width / 2 ? starIndex - 0.5 : starIndex;
        setHoveredRating(rating);
    };

    if (!currentMenu) return null;

    const renderStar = (starIndex: number) => {
        const displayRating = isHovering ? hoveredRating : userRating;
        const percentage = Math.min(100, Math.max(0, (displayRating - (starIndex - 1)) * 100));

        return (
            <div
                key={starIndex}
                className="relative inline-block cursor-pointer"
                onMouseMove={(e) => handleStarHover(e, starIndex)}
                onClick={() => handleRating(hoveredRating || userRating)}
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
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                        Günün Menüsü
                    </h1>
                    <div className="flex items-center justify-center space-x-4">
                        <button
                            onClick={handlePrevious}
                            disabled={menuIndex === 0}
                            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-semibold text-gray-700">{currentDate}</h2>
                        <button
                            onClick={handleNext}
                            disabled={menuIndex === menuData.menus.length - 1}
                            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Soup */}
                    <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
                        <div className="flex items-center justify-center mb-4">
                            <Soup className="w-8 h-8 text-orange-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Çorba</h3>
                        <p className="text-gray-600 text-center">{currentMenu.soup}</p>
                    </div>

                    {/* Main Course */}
                    <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
                        <div className="flex items-center justify-center mb-4">
                            <Utensils className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Ana Yemek</h3>
                        <p className="text-gray-600 text-center">{currentMenu.main_course}</p>
                    </div>

                    {/* Side Dish */}
                    <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
                        <div className="flex items-center justify-center mb-4">
                            <Salad className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Yan Yemek</h3>
                        <p className="text-gray-600 text-center">{currentMenu.side_dish}</p>
                    </div>

                    {/* Dessert/Drink */}
                    <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
                        <div className="flex items-center justify-center mb-4">
                            <Coffee className="w-8 h-8 text-purple-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Tatlı/İçecek</h3>
                        <p className="text-gray-600 text-center">{currentMenu.dessert_drink}</p>
                    </div>
                </div>

                {/* Rating Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div
                        className="flex items-center justify-center space-x-1"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => {
                            setIsHovering(false);
                            setHoveredRating(0);
                        }}
                    >
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((index) => renderStar(index))}
                        </div>
                        <div className="ml-4 text-sm text-gray-500">
                            {currentMenu.ratings.average.toFixed(1)} ({Object.keys(currentMenu.ratings.votes).length})
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;