"""
Mock Data Seeder for Intelligent School Directory System
Run this to populate the database with sample data including Year Levels
"""

import requests
import time

API_URL = "http://localhost:8000/api"

# Sample mock data with Year Levels
sample_people = [
    # ============ STUDENTS with Year Levels ============
    # Computer Science Students
    {
        "full_name": "Juan Dela Cruz",
        "department": "Computer Science",
        "role": "student",
        "year_level": "1st Year",
        "email": "juan.delacruz@university.edu",
        "contact": "+639171234567",
        "status": "active"
    },
    {
        "full_name": "Maria Santos",
        "department": "Computer Science",
        "role": "student",
        "year_level": "2nd Year",
        "email": "maria.santos@university.edu",
        "contact": "+639172345678",
        "status": "active"
    },
    {
        "full_name": "Jose Rizal",
        "department": "Computer Science",
        "role": "student",
        "year_level": "3rd Year",
        "email": "jose.rizal@university.edu",
        "contact": "+639173456789",
        "status": "active"
    },
    {
        "full_name": "Andres Bonifacio",
        "department": "Computer Science",
        "role": "student",
        "year_level": "4th Year",
        "email": "andres.bonifacio@university.edu",
        "contact": "+639174567890",
        "status": "active"
    },
    
    # Information Technology Students
    {
        "full_name": "Gabriela Silang",
        "department": "Information Technology",
        "role": "student",
        "year_level": "1st Year",
        "email": "gabriela.silang@university.edu",
        "contact": "+639175678901",
        "status": "active"
    },
    {
        "full_name": "Lapu-Lapu",
        "department": "Information Technology",
        "role": "student",
        "year_level": "2nd Year",
        "email": "lapulapu@university.edu",
        "contact": "+639176789012",
        "status": "active"
    },
    {
        "full_name": "Melchora Aquino",
        "department": "Information Technology",
        "role": "student",
        "year_level": "3rd Year",
        "email": "melchora.aquino@university.edu",
        "contact": "+639177890123",
        "status": "active"
    },
    
    # Entertainment and Multimedia Computing Students
    {
        "full_name": "Fernando Poe Jr.",
        "department": "Entertainment and Multimedia Computing",
        "role": "student",
        "year_level": "2nd Year",
        "email": "fpj@university.edu",
        "contact": "+639178901234",
        "status": "active"
    },
    {
        "full_name": "Nora Aunor",
        "department": "Entertainment and Multimedia Computing",
        "role": "student",
        "year_level": "3rd Year",
        "email": "nora.aunor@university.edu",
        "contact": "+639179012345",
        "status": "active"
    },
    {
        "full_name": "Manny Pacquiao",
        "department": "Entertainment and Multimedia Computing",
        "role": "student",
        "year_level": "4th Year",
        "email": "manny.pacquiao@university.edu",
        "contact": "+639180123456",
        "status": "active"
    },
    
    # Computer Engineering Students
    {
        "full_name": "Diosdado Macapagal",
        "department": "Computer Engineering",
        "role": "student",
        "year_level": "1st Year",
        "email": "diosdado.macapagal@university.edu",
        "contact": "+639181234567",
        "status": "active"
    },
    {
        "full_name": "Corazon Aquino",
        "department": "Computer Engineering",
        "role": "student",
        "year_level": "2nd Year",
        "email": "corazon.aquino@university.edu",
        "contact": "+639182345678",
        "status": "active"
    },
    {
        "full_name": "Ramon Magsaysay",
        "department": "Computer Engineering",
        "role": "student",
        "year_level": "3rd Year",
        "email": "ramon.magsaysay@university.edu",
        "contact": "+639183456789",
        "status": "active"
    },
    
    # Information Systems Students
    {
        "full_name": "Gloria Macapagal Arroyo",
        "department": "Information Systems",
        "role": "student",
        "year_level": "2nd Year",
        "email": "gma@university.edu",
        "contact": "+639184567890",
        "status": "active"
    },
    {
        "full_name": "Fidel Ramos",
        "department": "Information Systems",
        "role": "student",
        "year_level": "3rd Year",
        "email": "fidel.ramos@university.edu",
        "contact": "+639185678901",
        "status": "active"
    },
    
    # Data Science Students
    {
        "full_name": "Benigno Aquino III",
        "department": "Data Science",
        "role": "student",
        "year_level": "3rd Year",
        "email": "pnoy@university.edu",
        "contact": "+639186789012",
        "status": "active"
    },
    {
        "full_name": "Rodrigo Duterte",
        "department": "Data Science",
        "role": "student",
        "year_level": "4th Year",
        "email": "rodrigo.duterte@university.edu",
        "contact": "+639187890123",
        "status": "active"
    },
    
    # Inactive student example
    {
        "full_name": "Ferdinand Marcos",
        "department": "Computer Science",
        "role": "student",
        "year_level": "4th Year",
        "email": "ferdinand.marcos@university.edu",
        "contact": "+639188901234",
        "status": "inactive"
    },
    {
        "full_name": "Emilio Aguinaldo",
        "department": "Information Technology",
        "role": "student",
        "year_level": "1st Year",
        "email": "emilio.aguinaldo@university.edu",
        "contact": "",
        "status": "active"
    },
    
    # ============ FACULTY (No Year Level) ============
    {
        "full_name": "Dr. Fe Del Mundo",
        "department": "Computer Science",
        "role": "faculty",
        "year_level": None,
        "email": "fe.delmundo@university.edu",
        "contact": "+639189012345",
        "status": "active"
    },
    {
        "full_name": "Prof. Gregorio Y. Zara",
        "department": "Computer Engineering",
        "role": "faculty",
        "year_level": None,
        "email": "gregorio.zara@university.edu",
        "contact": "+639189123456",
        "status": "active"
    },
    {
        "full_name": "Dr. Paulo Campos",
        "department": "Information Technology",
        "role": "faculty",
        "year_level": None,
        "email": "paulo.campos@university.edu",
        "contact": "+639189234567",
        "status": "active"
    },
    {
        "full_name": "Prof. Josefino Comiso",
        "department": "Data Science",
        "role": "faculty",
        "year_level": None,
        "email": "josefino.comiso@university.edu",
        "contact": "+639189345678",
        "status": "active"
    },
    {
        "full_name": "Dr. Lourdes Cruz",
        "department": "Information Systems",
        "role": "faculty",
        "year_level": None,
        "email": "lourdes.cruz@university.edu",
        "contact": "+639189456789",
        "status": "active"
    },
    {
        "full_name": "Prof. Ramon Barba",
        "department": "Entertainment and Multimedia Computing",
        "role": "faculty",
        "year_level": None,
        "email": "ramon.barba@university.edu",
        "contact": "+639189567890",
        "status": "active"
    },
    {
        "full_name": "Dr. Enrique Ostrea",
        "department": "Computer Science",
        "role": "faculty",
        "year_level": None,
        "email": "enrique.ostrea@university.edu",
        "contact": "+639189678901",
        "status": "inactive"
    },
    
    # ============ STAFF (No Year Level) ============
    {
        "full_name": "Cory Quirino",
        "department": "Administration",
        "role": "staff",
        "year_level": None,
        "email": "cory.quirino@university.edu",
        "contact": "+639189789012",
        "status": "active"
    },
    {
        "full_name": "Boy Abunda",
        "department": "Registrar",
        "role": "staff",
        "year_level": None,
        "email": "boy.abunda@university.edu",
        "contact": "+639189890123",
        "status": "active"
    },
    {
        "full_name": "Kris Aquino",
        "department": "IT Services",
        "role": "staff",
        "year_level": None,
        "email": "kris.aquino@university.edu",
        "contact": "+639189901234",
        "status": "active"
    }
]

# Sample Events
sample_events = [
    {
        "title": "Tech Conference 2024",
        "description": "Annual technology conference featuring guest speakers from top tech companies. Topics include AI, Machine Learning, and Cybersecurity.",
        "date": "2024-12-15T09:00:00",
        "location": "Main Auditorium",
        "image_url": "https://picsum.photos/id/0/400/200",
        "event_link": "https://example.com/tech-conference-2024",
        "organizer": "Computer Science Department",
        "created_by": "Admin"
    },
    {
        "title": "Hackathon 2024",
        "description": "24-hour coding competition. Form your team and build innovative solutions. Prizes for top 3 teams!",
        "date": "2024-11-20T08:00:00",
        "location": "Innovation Hub",
        "image_url": "https://picsum.photos/id/26/400/200",
        "event_link": "https://example.com/hackathon-2024",
        "organizer": "IT Society",
        "created_by": "Admin"
    },
    {
        "title": "Career Fair",
        "description": "Meet recruiters from top companies. Bring your resume and portfolio. Open to all students.",
        "date": "2024-10-25T10:00:00",
        "location": "University Gymnasium",
        "image_url": "https://picsum.photos/id/20/400/200",
        "event_link": "https://example.com/career-fair",
        "organizer": "Career Services Office",
        "created_by": "Admin"
    },
    {
        "title": "Research Symposium",
        "description": "Showcase of student research projects. Best paper award and networking opportunities.",
        "date": "2024-11-05T13:00:00",
        "location": "Conference Room A",
        "image_url": "https://picsum.photos/id/42/400/200",
        "event_link": "https://example.com/research-symposium",
        "organizer": "Research Department",
        "created_by": "Admin"
    },
    {
        "title": "Freshmen Orientation",
        "description": "Welcome new students! Learn about campus resources, meet faculty, and make new friends.",
        "date": "2024-10-01T09:00:00",
        "location": "University Auditorium",
        "image_url": "https://picsum.photos/id/100/400/200",
        "event_link": "",
        "organizer": "Student Affairs Office",
        "created_by": "Admin"
    },
    {
        "title": "Christmas Party 2024",
        "description": "Annual university Christmas celebration with games, food, and prizes. Dress code: Christmas themed!",
        "date": "2024-12-20T17:00:00",
        "location": "University Quadrangle",
        "image_url": "https://picsum.photos/id/30/400/200",
        "event_link": "",
        "organizer": "Student Council",
        "created_by": "Admin"
    }
]

def clear_database():
    """Clear all existing data"""
    print("Clearing existing data...")
    
    # Clear people
    response = requests.get(f"{API_URL}/people")
    if response.status_code == 200:
        for person in response.json():
            requests.delete(f"{API_URL}/people/{person['id']}")
    
    # Clear events
    response = requests.get(f"{API_URL}/events")
    if response.status_code == 200:
        for event in response.json():
            requests.delete(f"{API_URL}/events/{event['id']}")
    
    print("Database cleared!")

def seed_database():
    """Seed the database with mock data"""
    print("\n" + "=" * 60)
    print("   INTELLIGENT SCHOOL DIRECTORY SYSTEM")
    print("   Mock Data Seeder")
    print("=" * 60)
    
    # Wait for backend to be ready
    print("\nChecking backend connection...")
    try:
        response = requests.get("http://localhost:8000/")
        if response.status_code == 200:
            print("✓ Backend is running!")
        else:
            print("✗ Backend not responding. Make sure it's running on port 8000")
            return
    except:
        print("✗ Cannot connect to backend. Make sure it's running:")
        print("  cd backend")
        print("  venv\\Scripts\\activate")
        print("  uvicorn app:app --reload --port 8000")
        return
    
    # Ask if user wants to clear existing data
    choice = input("\nDo you want to clear existing data before seeding? (y/n): ")
    if choice.lower() == 'y':
        clear_database()
        time.sleep(1)
    
    print("\nSeeding Students and Faculty...")
    print("-" * 40)
    
    students_count = 0
    faculty_count = 0
    staff_count = 0
    error_count = 0
    
    for person in sample_people:
        try:
            response = requests.post(f"{API_URL}/people", json=person)
            if response.status_code == 200:
                role = person['role']
                if role == 'student':
                    students_count += 1
                    print(f"  ✓ Added Student: {person['full_name']} - {person['year_level']} - {person['department']}")
                elif role == 'faculty':
                    faculty_count += 1
                    print(f"  ✓ Added Faculty: {person['full_name']} - {person['department']}")
                else:
                    staff_count += 1
                    print(f"  ✓ Added Staff: {person['full_name']} - {person['department']}")
            else:
                print(f"  ✗ Failed: {person['full_name']} - Status: {response.status_code}")
                error_count += 1
        except Exception as e:
            print(f"  ✗ Error adding {person['full_name']}: {str(e)}")
            error_count += 1
        time.sleep(0.1)  # Small delay to avoid overwhelming the server
    
    print("\nSeeding Events...")
    print("-" * 40)
    
    events_count = 0
    for event in sample_events:
        try:
            response = requests.post(f"{API_URL}/events", json=event)
            if response.status_code == 200:
                events_count += 1
                print(f"  ✓ Added Event: {event['title']}")
            else:
                print(f"  ✗ Failed to add event: {event['title']}")
                error_count += 1
        except Exception as e:
            print(f"  ✗ Error adding event {event['title']}: {str(e)}")
            error_count += 1
        time.sleep(0.1)
    
    # Display summary
    print("\n" + "=" * 60)
    print("SEEDING COMPLETED!")
    print("=" * 60)
    print(f"\n📊 SUMMARY:")
    print(f"  🎓 Students added: {students_count}")
    print(f"  👨‍🏫 Faculty added: {faculty_count}")
    print(f"  👔 Staff added: {staff_count}")
    print(f"  📅 Events added: {events_count}")
    print(f"  ❌ Errors: {error_count}")
    
    # Get statistics from API
    try:
        response = requests.get(f"{API_URL}/statistics")
        if response.status_code == 200:
            stats = response.json()
            print(f"\n📈 CURRENT STATISTICS:")
            print(f"  Total Students: {stats.get('students', 0)}")
            print(f"  Total Faculty: {stats.get('faculty', 0)}")
            print(f"  Total Staff: {stats.get('staff', 0)}")
            print(f"  Active Records: {stats.get('active', 0)}")
            print(f"  Total Records: {stats.get('total', 0)}")
    except:
        pass
    
    print("\n✅ Database seeding completed successfully!")
    print("\nYou can now:")
    print("  1. View Students with Year Levels in the Students page")
    print("  2. Filter by Department and Year Level")
    print("  3. View Faculty in the Faculty page")
    print("  4. Check Events in the Events page")
    print("  5. See Department Distribution in Dashboard")

if __name__ == "__main__":
    seed_database()