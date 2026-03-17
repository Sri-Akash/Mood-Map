from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db = None
    
    @classmethod
    def connect(cls, uri: str = None):
        """Connect to MongoDB"""
        uri = uri or os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        cls.client = AsyncIOMotorClient(uri)
        cls.db = cls.client.moodmap
        return cls.db
    
    @classmethod
    def get_collection(cls, name: str):
        """Get a collection from the database"""
        if cls.db is None:
            raise Exception("Database not connected")
        return cls.db[name]
    
    @classmethod
    def disconnect(cls):
        """Disconnect from MongoDB"""
        if cls.client:
            cls.client.close()

# Collection helpers
def get_checkins_collection():
    return Database.get_collection("checkins")

def get_users_collection():
    return Database.get_collection("users")

def get_patterns_collection():
    return Database.get_collection("patterns")
