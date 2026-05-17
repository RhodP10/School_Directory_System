from collections import Counter, defaultdict
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import Person, SearchQuery
from typing import List, Dict

class PredictionEngine:
    
    def __init__(self, db: Session):
        self.db = db
        self.search_patterns = defaultdict(int)
        self.time_based_patterns = defaultdict(list)
    
    def analyze_search_patterns(self):
        """Analyze search patterns from database"""
        searches = self.db.query(SearchQuery).all()
        
        for search in searches:
            self.search_patterns[search.query] = search.search_count
    
    def predict_frequent_searches(self, limit: int = 5) -> List[Dict]:
        """Predict most frequent searches"""
        self.analyze_search_patterns()
        
        sorted_patterns = sorted(
            self.search_patterns.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        return [
            {"query": query, "frequency": count}
            for query, count in sorted_patterns[:limit]
        ]
    
    def get_contextual_suggestions(self, current_time=None):
        """Get suggestions based on time context"""
        if current_time is None:
            current_time = datetime.now()
        
        suggestions = []
        
        # Time-based suggestions
        hour = current_time.hour
        
        if 9 <= hour < 12:
            suggestions.append("Morning classes - Faculty search recommended")
        elif 12 <= hour < 14:
            suggestions.append("Lunch break - Most active search time")
        elif 14 <= hour < 17:
            suggestions.append("Afternoon sessions - Department searches active")
        
        # Get popular searches from last hour (simulated)
        recent_popular = self.predict_frequent_searches(3)
        suggestions.extend([f"Popular: {item['query']}" for item in recent_popular])
        
        return suggestions
    
    def get_related_queries(self, query: str, limit: int = 3) -> List[str]:
        """Find related queries based on search history"""
        related = []
        
        # Search for similar queries in history
        searches = self.db.query(SearchQuery).filter(
            SearchQuery.query.contains(query.lower())
        ).order_by(SearchQuery.search_count.desc()).limit(limit).all()
        
        for search in searches:
            if search.query != query.lower():
                related.append(search.query)
        
        return related
    
    def predict_next_search(self, user_context: Dict = None) -> str:
        """Predict next most likely search"""
        popular = self.predict_frequent_searches(1)
        if popular:
            return popular[0]["query"]
        return "student"
    
    def get_department_trends(self) -> Dict:
        """Analyze which departments are most searched"""
        department_searches = defaultdict(int)
        
        # This would typically analyze search queries that include department names
        # Simplified version
        departments = ["Computer Science", "Engineering", "Business", "Medicine", "Arts"]
        
        searches = self.db.query(SearchQuery).all()
        for search in searches:
            for dept in departments:
                if dept.lower() in search.query.lower():
                    department_searches[dept] += search.search_count
        
        return dict(department_searches)