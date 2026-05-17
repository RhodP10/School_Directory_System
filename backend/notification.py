from sqlalchemy.orm import Session
from models import Person, Notification
from datetime import datetime, timedelta
from typing import List, Dict

class NotificationEngine:
    
    @staticmethod
    def detect_outdated_records(db: Session) -> List[Dict]:
        notifications = []
        
        # Check for inactive records
        inactive_records = db.query(Person).filter(Person.status == "inactive").all()
        for record in inactive_records:
            notifications.append({
                "type": "outdated",
                "message": f"Record for {record.full_name} ({record.role}) is marked as inactive and needs review",
                "person_id": record.id,
                "priority": "high"
            })
        
        # Check for missing contact information
        missing_contact = db.query(Person).filter(
            (Person.contact == None) | (Person.contact == "")
        ).all()
        for record in missing_contact:
            notifications.append({
                "type": "missing_info",
                "message": f"{record.full_name} is missing contact information",
                "person_id": record.id,
                "priority": "medium"
            })
        
        # Check for duplicate emails
        from sqlalchemy import func
        duplicates = db.query(Person.email, func.count(Person.id)).group_by(Person.email).having(func.count(Person.id) > 1).all()
        
        for email, count in duplicates:
            if email:
                notifications.append({
                    "type": "duplicate",
                    "message": f"Email {email} appears {count} times in the directory",
                    "priority": "high"
                })
        
        # Check for records not updated in 6 months
        six_months_ago = datetime.utcnow() - timedelta(days=180)
        old_records = db.query(Person).filter(Person.last_updated < six_months_ago).all()
        for record in old_records:
            notifications.append({
                "type": "stale",
                "message": f"{record.full_name}'s record hasn't been updated in over 6 months",
                "person_id": record.id,
                "priority": "low"
            })
        
        # Store notifications in database
        for notif in notifications:
            db_notif = Notification(
                message=notif["message"],
                type=notif["type"],
                is_read=False
            )
            db.add(db_notif)
        
        db.commit()
        
        return notifications
    
    @staticmethod
    def get_notifications(db: Session, limit: int = 20, unread_only: bool = False):
        query = db.query(Notification)
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        return query.order_by(Notification.created_at.desc()).limit(limit).all()
    
    @staticmethod
    def mark_as_read(db: Session, notification_id: int):
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if notification:
            notification.is_read = True
            db.commit()
        return notification
    
    @staticmethod
    def generate_summary_report(db: Session):
        notifications = NotificationEngine.get_notifications(db, limit=50)
        
        summary = {
            "total": len(notifications),
            "unread": len([n for n in notifications if not n.is_read]),
            "by_type": {},
            "by_priority": {
                "high": 0,
                "medium": 0,
                "low": 0
            }
        }
        
        for notif in notifications:
            summary["by_type"][notif.type] = summary["by_type"].get(notif.type, 0) + 1
            
            # Determine priority from message content (simplified)
            if "inactive" in notif.message or "duplicate" in notif.message:
                summary["by_priority"]["high"] += 1
            elif "missing" in notif.message:
                summary["by_priority"]["medium"] += 1
            else:
                summary["by_priority"]["low"] += 1
        
        return summary