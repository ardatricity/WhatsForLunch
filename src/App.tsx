import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Soup, Utensils, Salad, Coffee, Star } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, query, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface MenuItem {
  date: string;
  soup: string;
  main_course: string;
  side_dish: string;
  dessert_drink: string;
  ratings: {
    votes: Record<string, number>;
    average: number;
  };
}

function RatingSystem({
    currentRating,
    userRating,
    totalVotes,
    onRate
}: {
    currentRating: number;
    userRating: number;
    totalVotes: number;
    onRate: (rating: number) => void;
}) {
    const handleStarClick = (position: number, event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        const element = event.currentTarget as HTMLButtonElement;
        const rect = element.getBoundingClientRect();
        const x = 'touches' in event ? event.touches[0].clientX - rect.left : event.clientX - rect.left;
        const rating = x < rect.width / 2 ? position - 0.5 : position;
        onRate(rating);
    };

    const renderStar = (position: number) => {
        const isUserFilled = position <= userRating;
        const isAverageFilled = position <= currentRating;
        const isHalfUserFilled = position - 0.5 === userRating;

        return (
            <button
                key={position}
                className="w-8 h-8 relative focus:outline-none transform transition-transform duration-100 hover:scale-110"
                onClick={(e) => handleStarClick(position, e)}
                onTouchStart={(e) => handleStarClick(position, e)}
                onTouchMove={(e) => handleStarClick(position, e)}
            >
                <Star
                    className={`w-full h-full absolute top-0 left-0 
            ${isUserFilled ? 'fill-[#ffda6b] shadow-sm' : ''} 
            ${isHalfUserFilled ? 'fill-[#ffda6b] shadow-sm' : ''}
            text-gray-300`}
                    style={{
                        stroke: isAverageFilled ? '#e0a300' : '#ccc',
                        strokeWidth: 2,
                        clipPath: isHalfUserFilled ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' : 'none',
                        
                    }}
                />
                 {isHalfUserFilled && (
          <Star
            className="w-full h-full absolute top-0 left-0 text-gray-300"
            style={{
              clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)',
              backgroundColor: 'transparent',
              stroke: isAverageFilled ? '#e0a300' : '#ccc',
              strokeWidth: 2,
            }}
          />
        )}
            </button>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-center space-x-4">
                <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(position => renderStar(position))}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="font-semibold">{currentRating.toFixed(1)}</span>
                    <span>({totalVotes} oy)</span>
                </div>
            </div>
            {userRating > 0 && (
                <div className="text-xs text-center mt-2 text-gray-500">
                    Puanınız: {userRating.toFixed(1)}
                </div>
            )}
        </div>
    );
}

function App() {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentMenu, setCurrentMenu] = useState<MenuItem | null>(null);
  const [menuIndex, setMenuIndex] = useState(0);
  const [userRating, setUserRating] = useState<number>(0);
  const [menus, setMenus] = useState<MenuItem[]>([]);

  useEffect(() => {
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', Math.random().toString(36).substring(2));
    }
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const menusCollection = collection(db, 'menus');
      const menusSnapshot = await getDocs(query(menusCollection));
      const menusList: MenuItem[] = [];
      
      menusSnapshot.forEach((doc) => {
        menusList.push(doc.data() as MenuItem);
      });

      const parseDate = (dateString: string): Date => {
        const [day, month, year] = dateString.split('.').map(Number);
        // in JavaScript, months are 0-based (0 = January, 1 = February, etc.)
        return new Date(year, month - 1, day);
      };

      menusList.sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

      setMenus(menusList);
      if (menusList.length > 0) {
        setMenuIndex(menusList.length-1);
        setCurrentMenu(menusList[menusList.length-1]);
        setCurrentDate(menusList[menusList.length-1].date);
        
        const userId = localStorage.getItem('userId') || '';
        const userPreviousRating = menusList[menusList.length-1].ratings.votes[userId] || 0;
        setUserRating(userPreviousRating);
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };

  useEffect(() => {
    if (menus.length > 0 && menuIndex >= 0 && menuIndex < menus.length) {
      const menu = menus[menuIndex];
      setCurrentMenu(menu);
      setCurrentDate(menu.date);
      
      const userId = localStorage.getItem('userId') || '';
      const userPreviousRating = menu.ratings.votes[userId] || 0;
      setUserRating(userPreviousRating);
    }
  }, [menuIndex, menus]);

  const handlePrevious = () => {
    if (menuIndex > 0) {
      setMenuIndex(menuIndex - 1);
    }
  };

  const handleNext = () => {
    if (menuIndex < menus.length - 1) {
      setMenuIndex(menuIndex + 1);
    }
  };

  const handleRating = async (rating: number) => {
    if (!currentMenu) return;

    const userId = localStorage.getItem('userId') || '';
    const updatedMenu = { ...currentMenu };
    
    // Update the vote
    updatedMenu.ratings.votes[userId] = rating;
    
    // Calculate new average
    const votes = Object.values(updatedMenu.ratings.votes);
    const newAverage = votes.length > 0 
      ? votes.reduce((a, b) => a + b, 0) / votes.length 
      : 0;
    
    updatedMenu.ratings.average = Number(newAverage.toFixed(1));

    try {
      // Update local state first for immediate feedback
      const updatedMenus = [...menus];
      updatedMenus[menuIndex] = updatedMenu;
      setMenus(updatedMenus);
      setCurrentMenu(updatedMenu);
      setUserRating(rating);

      // Then update Firebase
      await setDoc(doc(db, 'menus', updatedMenu.date), updatedMenu);
    } catch (error) {
      console.error("Error updating rating:", error);
      // Revert local state if Firebase update fails
      fetchMenus();
    }
  };

  if (!currentMenu) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
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
              disabled={menuIndex === menus.length - 1}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <Soup className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Çorba</h3>
            <p className="text-gray-600 text-center">{currentMenu.soup}</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <Utensils className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Ana Yemek</h3>
            <p className="text-gray-600 text-center">{currentMenu.main_course}</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <Salad className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Yan Yemek</h3>
            <p className="text-gray-600 text-center">{currentMenu.side_dish}</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <Coffee className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Tatlı/İçecek</h3>
            <p className="text-gray-600 text-center">{currentMenu.dessert_drink}</p>
          </div>
        </div>

        <RatingSystem
          currentRating={currentMenu.ratings.average}
          userRating={userRating}
          totalVotes={Object.keys(currentMenu.ratings.votes).length}
          onRate={handleRating}
        />
      </div>
    </div>
  );
}

export default App;