from sqlalchemy.orm import Session
from models import Event
from datetime import datetime

def create_event(db: Session, data: dict):
    """Create a new event"""
    try:
        event = Event(**data)
        db.add(event)
        db.commit()
        db.refresh(event)
        return event
    except Exception as e:
        db.rollback()
        raise e

def get_all_events(db: Session, skip: int = 0, limit: int = 50):
    """Get all events"""
    return db.query(Event).order_by(Event.date.desc()).offset(skip).limit(limit).all()

def get_upcoming_events(db: Session, limit: int = 20):
    """Get upcoming events"""
    now = datetime.now()
    return db.query(Event).filter(Event.date > now).order_by(Event.date.asc()).limit(limit).all()

def get_event_by_id(db: Session, event_id: int):
    """Get a specific event"""
    return db.query(Event).filter(Event.id == event_id).first()

def update_event(db: Session, event_id: int, updated_data: dict):
    """Update an event"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if event:
        for key, value in updated_data.items():
            if hasattr(event, key) and value is not None:
                setattr(event, key, value)
        db.commit()
        db.refresh(event)
    return event

def delete_event(db: Session, event_id: int):
    """Delete an event"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if event:
        db.delete(event)
        db.commit()
        return True
    return False