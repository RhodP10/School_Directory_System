from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import Person, SearchQuery, Notification
from datetime import datetime

def create_person(db: Session, data: dict):
    """Create a new person record"""
    try:
        # Remove id if it exists in data
        if 'id' in data:
            del data['id']
        
        person = Person(**data)
        db.add(person)
        db.commit()
        db.refresh(person)
        return person
    except Exception as e:
        db.rollback()
        raise e

def get_all_people(db: Session, skip: int = 0, limit: int = 100):
    """Get all people records"""
    return db.query(Person).offset(skip).limit(limit).all()

def get_person_by_id(db: Session, person_id: int):
    """Get a specific person by ID"""
    return db.query(Person).filter(Person.id == person_id).first()

def update_person(db: Session, person_id: int, updated_data: dict):
    """Update a person record"""
    person = db.query(Person).filter(Person.id == person_id).first()
    
    if person:
        for key, value in updated_data.items():
            if hasattr(person, key) and value is not None:
                setattr(person, key, value)
        
        person.last_updated = datetime.utcnow()
        db.commit()
        db.refresh(person)
    
    return person

def delete_person(db: Session, person_id: int):
    """Delete a person record"""
    person = db.query(Person).filter(Person.id == person_id).first()
    
    if person:
        db.delete(person)
        db.commit()
        return True
    
    return False

def get_statistics(db: Session):
    """Get system statistics"""
    total_students = db.query(Person).filter(Person.role == "student").count()
    total_faculty = db.query(Person).filter(Person.role == "faculty").count()
    total_staff = db.query(Person).filter(Person.role == "staff").count()
    active_records = db.query(Person).filter(Person.status == "active").count()
    total_records = db.query(Person).count()
    
    return {
        "students": total_students,
        "faculty": total_faculty,
        "staff": total_staff,
        "active": active_records,
        "total": total_records
    }

def get_people_by_role(db: Session, role: str):
    """Get people by role"""
    return db.query(Person).filter(Person.role == role).all()