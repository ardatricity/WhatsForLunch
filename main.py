import json
from bs4 import BeautifulSoup
from datetime import datetime, date
import requests
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os

# Firebase'i başlat
cred = credentials.ApplicationDefault()
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {
        'projectId': os.environ.get('GCP_PROJECT'),
    })

db = firestore.client()

def extract_meal_list(html_content):
    """Extracts the personnel meal list from the HTML content."""
    soup = BeautifulSoup(html_content, 'html.parser')
    personnel_meal_list_header = soup.find('h1', string='Personel Yemek Listesi')

    if personnel_meal_list_header:
        personnel_meal_list_ul = personnel_meal_list_header.find_next('ul')
        if personnel_meal_list_ul:
            meals = [li.text.strip() for li in personnel_meal_list_ul.find_all('li')]
            return meals
        else:
            print("Personnel meal list not found.")
            return None
    else:
        print("Personnel Meal List header not found.")
        return None

def add_meal_to_database(meals):
    """Adds the meal list to the Firestore database."""
    if meals:
        today = date.today().strftime("%d.%m.%Y")
        doc_ref = db.collection("menus").document(today)

        menu_data = {
            "date": today,
            "soup": meals[0] if len(meals) > 0 else "",
            "main_course": meals[1] if len(meals) > 1 else "",
            "side_dish": meals[2] if len(meals) > 2 else "",
            "dessert_drink": meals[3] if len(meals) > 3 else "",
            "ratings": {
                "votes": {},
                "average": 0
            }
        }

        # Firestore'a ekle
        doc_ref.set(menu_data)
        print(f"Menu for {today} added to database.")
    else:
        print("No meal data to add.")

def scrape_and_upload(request):
    """The function that will run when the Cloud Function triggered."""
    # Güvenlik header'ını kontrol et
    expected_header = os.environ.get('SECURITY_HEADER')
    auth_header = request.headers.get('X-Custom-Security-Header')

    if auth_header != expected_header:
        return 'Unauthorized', 403

    # Web sayfasından yemek listesini çek
    req = requests.get("https://dpu.edu.tr/index/yemek")
    html_content = req.content
    meal_list = extract_meal_list(html_content)

    # Yemek listesini veritabanına ekle
    add_meal_to_database(meal_list)

    return 'Script executed successfully!'