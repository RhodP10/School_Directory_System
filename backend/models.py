from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from datetime import datetime
from database import Base

class Person(Base):
    __tablename__ = "people"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    department = Column(String)
    role = Column(String)
    year_level = Column(String, nullable=True)
    email = Column(String, unique=True)
    contact = Column(String)
    status = Column(String, default="active")
    profile_image = Column(String, nullable=True)  # This stores the image URL
    join_date = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Rest of your models remain the same...

class SearchQuery(Base):
    __tablename__ = "search_queries"
    
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, index=True)
    search_count = Column(Integer, default=1)
    last_searched = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    message = Column(String)
    type = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    date = Column(DateTime)
    location = Column(String)
    image_url = Column(String, nullable=True)
    event_link = Column(String, nullable=True)
    organizer = Column(String)
    created_by = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_upcoming = Column(Boolean, default=True)