import os
from typing import List, Optional
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import uvicorn

DATABASE_URL = "sqlite:///./teknolab.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- MODELLER ---
class YayinModel(Base):
    __tablename__ = "yayinlar"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    baslik = Column(String(250), nullable=False)
    yazarlar = Column(String(250), nullable=False)
    konferans_dergi = Column(String(150), nullable=False)
    yil = Column(Integer, nullable=False)
    doi_link = Column(String(200), nullable=True)

class EkipModel(Base):
    __tablename__ = "ekip"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ad_soyad = Column(String(100), nullable=False)
    unvan = Column(String(100), nullable=False)
    uzmanlik = Column(String(150), nullable=False)
    github = Column(String(150), nullable=True)
    linkedin = Column(String(150), nullable=True)

class BasariModel(Base):
    __tablename__ = "basarilar"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    baslik = Column(String(150), nullable=False)
    organizasyon = Column(String(100), nullable=False) # örn: TEKNOFEST, TÜBİTAK
    derece = Column(String(80), nullable=False)
    yil = Column(Integer, nullable=False)

class SponsorModel(Base):
    __tablename__ = "sponsorlar"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    isim = Column(String(100), nullable=False)
    tur = Column(String(50), nullable=False) # "Ana Destekçi", "Donanım Sponsoru", "Sanayi Ortağı"

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Başlangıç verileri
def varsayilan_veriler():
    db = SessionLocal()
    if db.query(EkipModel).count() == 0:
        db.add_all([
            EkipModel(ad_soyad="Dr. Öğr. Üyesi / Lab Direktörü", unvan="Laboratuvar Yöneticisi", uzmanlik="Robotik Kontrol & SLAM", github="https://github.com", linkedin="https://linkedin.com"),
            EkipModel(ad_soyad="Fatıma Feyza Karabıyık", unvan="Yazılım & Algoritma Araştırmacısı", uzmanlik="Yapay Zeka, Bilgisayarlı Görü & Gömülü Sistemler", github="https://github.com", linkedin="https://linkedin.com"),
            EkipModel(ad_soyad="Ar-Ge Araştırmacı Mühendisi", unvan="Otonom Sistemler Lideri", uzmanlik="ROS2, Sensör Füzyonu & Yol Planlama", github="https://github.com", linkedin="https://linkedin.com")
        ])
        db.add_all([
            YayinModel(baslik="Real-Time Anomaly Detection in Autonomous Systems via Edge Computing", yazarlar="Karabıyık, F. F. et al.", konferans_dergi="IEEE Robotics and Automation Letters", yil=2026, doi_link="https://doi.org"),
            YayinModel(baslik="Sensor Fusion Algorithms for GPS-Denied UAV Navigation", yazarlar="Lab Araştırma Grubu", konferans_dergi="International Conference on Unmanned Systems", yil=2025, doi_link="https://doi.org")
        ])
        db.add_all([
            BasariModel(baslik="Otonom Araç Yarışması", organizasyon="TEKNOFEST", derece="En Özgün Yazılım Ödülü", yil=2025),
            BasariModel(baslik="İleri Robotik Sistemler Ar-Ge Desteği", organizasyon="TÜBİTAK 2209-A / BiGG", derece="1. Aşama Kabul", yil=2026)
        ])
        db.add_all([
            SponsorModel(isim="ASELSAN", tur="Teknoloji & Ar-Ge Desteği"),
            SponsorModel(isim="TÜBİTAK", tur="Proje Fonu"),
            SponsorModel(isim="InnoPark Teknoloji Geliştirme Bölgesi", tur="Kuluçka & Altyapı Destekçisi")
        ])
        db.commit()
    db.close()

varsayilan_veriler()

app = FastAPI(title="Teknolab Portal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/yayinlar")
def yayinlari_al(db: Session = Depends(get_db)):
    return db.query(YayinModel).order_by(YayinModel.yil.desc()).all()

@app.get("/api/ekip")
def ekibi_al(db: Session = Depends(get_db)):
    return db.query(EkipModel).all()

@app.get("/api/basarilar")
def basarilari_al(db: Session = Depends(get_db)):
    return db.query(BasariModel).order_by(BasariModel.yil.desc()).all()

@app.get("/api/sponsorlar")
def sponsorlari_al(db: Session = Depends(get_db)):
    return db.query(SponsorModel).all()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)