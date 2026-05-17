from fastapi import FastAPI, Depends, HTTPException, Query, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
import shutil
import os
import logging

from database import SessionLocal, engine
from models import Base
from crud import (
    create_person, get_all_people, get_person_by_id,
    update_person, delete_person, get_statistics, get_people_by_role
)
from intelligent_search import IntelligentSearchEngine
from notification import NotificationEngine
from prediction import PredictionEngine

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Intelligent School Directory System", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Pydantic models
class PersonCreate(BaseModel):
    full_name: str
    department: str
    role: str
    year_level: Optional[str] = None
    email: str
    contact: str
    status: str = "active"
    profile_image: Optional[str] = None  # NEW

class PersonUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    year_level: Optional[str] = None
    email: Optional[str] = None
    contact: Optional[str] = None
    status: Optional[str] = None
    profile_image: Optional[str] = None  # NEW

class PersonResponse(BaseModel):
    id: int
    full_name: str
    department: str
    role: str
    year_level: Optional[str] = None
    email: str
    contact: str
    status: str
    profile_image: Optional[str] = None  # NEW
    
    class Config:
        from_attributes = True

class EventCreate(BaseModel):
    title: str
    description: str
    date: datetime
    location: str
    image_url: Optional[str] = None
    event_link: Optional[str] = None
    organizer: str
    created_by: str = "Admin"

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    event_link: Optional[str] = None
    organizer: Optional[str] = None
    is_upcoming: Optional[bool] = None

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Health check
@app.get("/")
def home():
    return {
        "message": "Intelligent School Directory System",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

# ============ CRUD Operations ============
@app.post("/api/people", response_model=PersonResponse)
def create_person_endpoint(person: PersonCreate, db: Session = Depends(get_db)):
    try:
        new_person = create_person(db, person.dict())
        return new_person
    except Exception as e:
        logger.error(f"Error creating person: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/people", response_model=List[PersonResponse])
def get_people(skip: int = 0, limit: int = 100, role: Optional[str] = None, db: Session = Depends(get_db)):
    if role:
        people = get_people_by_role(db, role)
    else:
        people = get_all_people(db, skip, limit)
    return people

@app.get("/api/people/{person_id}", response_model=PersonResponse)
def get_person(person_id: int, db: Session = Depends(get_db)):
    person = get_person_by_id(db, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person

@app.put("/api/people/{person_id}", response_model=PersonResponse)
def update_person_endpoint(person_id: int, person: PersonUpdate, db: Session = Depends(get_db)):
    updated = update_person(db, person_id, person.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Person not found")
    return updated

@app.delete("/api/people/{person_id}")
def delete_person_endpoint(person_id: int, db: Session = Depends(get_db)):
    deleted = delete_person(db, person_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Person not found")
    return {"success": True, "message": "Person deleted successfully", "id": person_id}

# ============ Intelligent Search Endpoints ============
@app.get("/api/search")
def search(query: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    results = IntelligentSearchEngine.intelligent_search(db, query)
    return {"query": query, "results": results, "count": len(results)}

@app.get("/api/search/fuzzy")
def fuzzy_search(query: str = Query(..., min_length=1), limit: int = 5, db: Session = Depends(get_db)):
    results = IntelligentSearchEngine.fuzzy_search(db, query, limit)
    return {"query": query, "results": results}

@app.get("/api/search/suggestions")
def get_suggestions(query: str = "", limit: int = 5, db: Session = Depends(get_db)):
    suggestions = IntelligentSearchEngine.get_suggestions(db, query, limit)
    return {"suggestions": suggestions}

@app.get("/api/search/popular")
def get_popular_searches(limit: int = 5, db: Session = Depends(get_db)):
    popular = IntelligentSearchEngine.get_popular_searches(db, limit)
    return {"popular_searches": popular}

@app.get("/api/search/analytics")
def get_search_analytics(months: int = 6, db: Session = Depends(get_db)):
    """Get real search analytics data"""
    analytics = IntelligentSearchEngine.get_search_analytics(db, months)
    return {"analytics": analytics}

# ============ Statistics Endpoints ============
@app.get("/api/statistics")
def get_stats(db: Session = Depends(get_db)):
    stats = get_statistics(db)
    return stats

# ============ Notification Endpoints ============
@app.get("/api/notifications")
def get_notifications(unread_only: bool = False, limit: int = 20, db: Session = Depends(get_db)):
    notifications = NotificationEngine.get_notifications(db, limit, unread_only)
    return [{"id": n.id, "message": n.message, "type": n.type, 
             "is_read": n.is_read, "created_at": n.created_at.isoformat()} 
            for n in notifications]

@app.post("/api/notifications/scan")
def scan_for_outdated_records(db: Session = Depends(get_db)):
    notifications = NotificationEngine.detect_outdated_records(db)
    return {"success": True, "notifications_found": len(notifications)}

@app.put("/api/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    notification = NotificationEngine.mark_as_read(db, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True}

@app.get("/api/notifications/summary")
def get_notification_summary(db: Session = Depends(get_db)):
    summary = NotificationEngine.generate_summary_report(db)
    return summary

# ============ Prediction Endpoints ============
@app.get("/api/predictions/frequent")
def get_frequent_predictions(limit: int = 5, db: Session = Depends(get_db)):
    prediction_engine = PredictionEngine(db)
    predictions = prediction_engine.predict_frequent_searches(limit)
    return {"predictions": predictions}

# ============ Event Functions ============
def create_event(db: Session, data: dict):
    from models import Event
    event = Event(**data)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

def get_all_events(db: Session, skip: int = 0, limit: int = 50):
    from models import Event
    return db.query(Event).order_by(Event.date.desc()).offset(skip).limit(limit).all()

def get_event_by_id(db: Session, event_id: int):
    from models import Event
    return db.query(Event).filter(Event.id == event_id).first()

def update_event(db: Session, event_id: int, updated_data: dict):
    from models import Event
    event = db.query(Event).filter(Event.id == event_id).first()
    if event:
        for key, value in updated_data.items():
            if hasattr(event, key) and value is not None:
                setattr(event, key, value)
        db.commit()
        db.refresh(event)
    return event

def delete_event(db: Session, event_id: int):
    from models import Event
    event = db.query(Event).filter(Event.id == event_id).first()
    if event:
        db.delete(event)
        db.commit()
        return True
    return False

# ============ Event Endpoints ============
@app.post("/api/events")
def create_event_endpoint(event: EventCreate, db: Session = Depends(get_db)):
    try:
        new_event = create_event(db, event.dict())
        return {"success": True, "data": {"id": new_event.id, "title": new_event.title, "description": new_event.description, "date": new_event.date.isoformat(), "location": new_event.location, "image_url": new_event.image_url, "event_link": new_event.event_link, "organizer": new_event.organizer, "created_at": new_event.created_at.isoformat()}}
    except Exception as e:
        logger.error(f"Error creating event: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/events")
def get_events(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    events = get_all_events(db, skip, limit)
    return [{"id": e.id, "title": e.title, "description": e.description, 
             "date": e.date.isoformat(), "location": e.location, 
             "image_url": e.image_url, "event_link": e.event_link, 
             "organizer": e.organizer, "created_at": e.created_at.isoformat()} 
            for e in events]

@app.get("/api/events/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"id": event.id, "title": event.title, "description": event.description, 
            "date": event.date.isoformat(), "location": event.location, 
            "image_url": event.image_url, "event_link": event.event_link, 
            "organizer": event.organizer, "created_at": event.created_at.isoformat()}

@app.put("/api/events/{event_id}")
def update_event_endpoint(event_id: int, event: EventUpdate, db: Session = Depends(get_db)):
    updated = update_event(db, event_id, event.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"success": True, "message": "Event updated successfully"}

@app.delete("/api/events/{event_id}")
def delete_event_endpoint(event_id: int, db: Session = Depends(get_db)):
    deleted = delete_event(db, event_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"success": True, "message": "Event deleted successfully"}

# ============ Image Upload ============
@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...)):
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{datetime.now().timestamp()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        image_url = f"http://localhost:8000/uploads/{unique_filename}"
        return {"success": True, "image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)