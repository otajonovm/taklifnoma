'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Volume2, 
  VolumeX, 
  Send, 
  Heart, 
  Sparkles, 
  Users, 
  Map, 
  ExternalLink, 
  Check, 
  Music,
  Trash2,
  CalendarCheck,
  Award,
  Maximize2,
  ShieldCheck
} from 'lucide-react';
import { INVITATION } from '@/lib/invitation-config';
import { readGuestNameFromSearch } from '@/lib/guest-link';

// RSVP interface
interface RSVPData {
  id: string;
  name: string;
  guestCount: number;
  status: 'will_attend' | 'cannot_attend';
  message: string;
  submittedAt: string;
}

// Pre-calculated stable heights and durations for audio visualizer to maintain absolute render purity
const EQUALIZER_BARS = [
  { id: 1, heights: [4, 18, 4], duration: 0.8 },
  { id: 2, heights: [4, 12, 4], duration: 0.95 },
  { id: 3, heights: [4, 20, 4], duration: 0.7 },
  { id: 4, heights: [4, 14, 4], duration: 0.85 },
  { id: 5, heights: [4, 10, 4], duration: 0.6 },
  { id: 6, heights: [4, 22, 4], duration: 0.75 },
  { id: 7, heights: [4, 16, 4], duration: 0.9 },
  { id: 8, heights: [4, 8, 4], duration: 0.65 },
  { id: 9, heights: [4, 19, 4], duration: 0.82 },
  { id: 10, heights: [4, 11, 4], duration: 0.88 },
  { id: 11, heights: [4, 15, 4], duration: 0.73 },
  { id: 12, heights: [4, 13, 4], duration: 0.78 },
];

export default function Home() {
  // Opening state: 'closed' -> 'opening' -> 'opened'
  const [openingState, setOpeningState] = useState<'closed' | 'opening' | 'opened'>('closed');
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Parallax Tilt state for the Main Card
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Parallax Tilt state for the Envelope Card
  const [envTilt, setEnvTilt] = useState({ x: 0, y: 0 });
  const [envGlare, setEnvGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const envelopeRef = useRef<HTMLDivElement>(null);

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false
  });

  // Framer Motion scroll parallax values
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1500], [0, -180]);
  const y2 = useTransform(scrollY, [0, 1500], [0, 200]);
  const y3 = useTransform(scrollY, [0, 1500], [0, -100]);



  // RSVP Form States
  const [name, setName] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [status, setStatus] = useState<'will_attend' | 'cannot_attend' | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvpSaved, setRsvpSaved] = useState<RSVPData | null>(null);
  const [allRsvps, setAllRsvps] = useState<RSVPData[]>([]);
  const [showGuestList, setShowGuestList] = useState(false);
  const [guestName, setGuestName] = useState('');

  const audioUrl = '/perfect.mp3';

  // Target Date: September 19, 2026, 18:00
  const targetDate = useMemo(() => new Date(INVITATION.eventDateISO), []);

  // Read personalized guest name from URL (?mehmon=... or /invite/... redirect)
  useEffect(() => {
    const nameFromUrl = readGuestNameFromSearch(window.location.search);
    if (nameFromUrl) {
      setGuestName(nameFromUrl);
      setName(nameFromUrl);
      document.title = `${nameFromUrl} — ${INVITATION.coupleShort} nikoh taklifnomasi`;
    } else {
      document.title = `${INVITATION.coupleShort} — ${INVITATION.eventTitle}`;
    }
  }, []);

  // Initialize data and countdown
  useEffect(() => {
    // Audio lazy initialization
    audioRef.current = new Audio(audioUrl);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    // Load RSVPs from localStorage safely without synchronous render-triggering state updates
    const saved = localStorage.getItem('premium_invitation_rsvps');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as RSVPData[];
        setTimeout(() => {
          setAllRsvps(parsed);
          if (parsed.length > 0) {
            setRsvpSaved(parsed[parsed.length - 1]);
          }
        }, 0);
      } catch (e) {
        console.error('Error parsing RSVPs', e);
      }
    }

    // Countdown Timer Loop
    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft(prev => ({ ...prev, isOver: true }));
        clearInterval(timer);
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({
          days: d,
          hours: h,
          minutes: m,
          seconds: s,
          isOver: false
        });
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [targetDate]);

  // Audio trigger
  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log("Audio autoplay restriction: ", err);
      });
    }
  };

  // 3D Parallax Mouse Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x coordinates within the element
    const y = e.clientY - rect.top;  // y coordinates within the element
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Smooth 3D tilt calculations (capped at 15 degrees)
    const tiltX = -((y - centerY) / centerY) * 12;
    const tiltY = ((x - centerX) / centerX) * 12;
    
    // Glare calculations
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: tiltX, y: tiltY });
    setGlare({ x: glareX, y: glareY, opacity: 0.35 });
  };

  const handleMouseLeave = () => {
    // Reset back to equilibrium smoothly
    setTilt({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  // For touch devices, simulate subtle tilt on drag/touch
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || e.touches.length === 0) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      const tiltX = -((y - centerY) / centerY) * 10;
      const tiltY = ((x - centerX) / centerX) * 10;
      setTilt({ x: tiltX, y: tiltY });
      setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.25 });
    }
  };

  const handleTouchEnd = () => {
    setTilt({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  // 3D Parallax Handlers for Envelope
  const handleEnvMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (openingState === 'opening' || !envelopeRef.current) return;
    const card = envelopeRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Smooth 3D tilt calculations for envelope (up to 14 degrees)
    const tiltX = -((y - centerY) / centerY) * 14;
    const tiltY = ((x - centerX) / centerX) * 14;
    
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setEnvTilt({ x: tiltX, y: tiltY });
    setEnvGlare({ x: glareX, y: glareY, opacity: 0.35 });
  };

  const handleEnvMouseLeave = () => {
    setEnvTilt({ x: 0, y: 0 });
    setEnvGlare(prev => ({ ...prev, opacity: 0 }));
  };

  const handleEnvTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (openingState === 'opening' || !envelopeRef.current || e.touches.length === 0) return;
    const card = envelopeRef.current;
    const rect = card.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      const tiltX = -((y - centerY) / centerY) * 10;
      const tiltY = ((x - centerX) / centerX) * 10;
      setEnvTilt({ x: tiltX, y: tiltY });
      setEnvGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.25 });
    }
  };

  const handleEnvTouchEnd = () => {
    setEnvTilt({ x: 0, y: 0 });
    setEnvGlare(prev => ({ ...prev, opacity: 0 }));
  };

  // Open Envelope Action
  const handleOpenEnvelope = () => {
    setOpeningState('opening');
    
    // Autoplay music upon interaction if possible
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        console.log("Music blocked until further user interaction");
      });
    }

    // Trigger canvas confetti spark on click
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FFFDF0', '#C0C0C0', '#B38B2D']
    });

    // Step to 'opened' state after envelope fold & rise animation
    setTimeout(() => {
      setOpeningState('opened');
    }, 1800);
  };

  // RSVP Submit Action
  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!status) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newRsvp: RSVPData = {
        id: Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        guestCount,
        status,
        message: message.trim(),
        submittedAt: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('uz-UZ')
      };

      const updatedRsvps = [...allRsvps, newRsvp];
      setAllRsvps(updatedRsvps);
      localStorage.setItem('premium_invitation_rsvps', JSON.stringify(updatedRsvps));
      setRsvpSaved(newRsvp);
      setIsSubmitting(false);

      // Trigger spectacular gold/champagne celebration confetti
      if (status === 'will_attend') {
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#D4AF37', '#FFFDF0', '#E5D3B3', '#C0C0C0']
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#D4AF37', '#FFFDF0', '#E5D3B3', '#C0C0C0']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      } else {
        // Simple subtle glitter for negative RSVPs
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#C0C0C0', '#8E9AAF']
        });
      }
    }, 1200);
  };

  // Delete RSVP (For testing/preview purposes)
  const handleDeleteRsvp = (id: string) => {
    const updated = allRsvps.filter(r => r.id !== id);
    setAllRsvps(updated);
    localStorage.setItem('premium_invitation_rsvps', JSON.stringify(updated));
    if (rsvpSaved?.id === id) {
      setRsvpSaved(null);
    }
  };

  // Clear Form for New Submission
  const handleResetForm = () => {
    setName('');
    setGuestCount(1);
    setStatus(null);
    setMessage('');
    setRsvpSaved(null);
  };

  return (
    <div id="app-root" className="relative min-h-screen overflow-x-hidden flex flex-col justify-between select-none font-sans bg-[#0B0F19]">
      
      {/* CSS 3D & Utility styles inside a React style tag for full self-containment */}
      <style jsx global>{`
        /* 3D Envelope and Perspective styles */
        .perspective-2000 {
          perspective: 2000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-x-180 {
          transform: rotateX(180deg);
        }
        
        /* Glow orbs of Artistic Flair theme */
        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.35;
          z-index: 0;
          pointer-events: none;
        }
        .orb-1 {
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, #1E3A8A 0%, transparent 75%);
          top: -150px;
          left: -150px;
        }
        .orb-2 {
          width: 550px;
          height: 550px;
          background: radial-gradient(circle, #312E81 0%, transparent 75%);
          bottom: -200px;
          right: -150px;
        }
        .orb-3 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, #D4AF37 0%, transparent 75%);
          top: 35%;
          left: 45%;
          opacity: 0.12;
        }

        /* Ambient glow for text */
        .card-arabic-pattern {
          background-image: 
            linear-gradient(45deg, rgba(214, 175, 55, 0.08) 25%, transparent 25%), 
            linear-gradient(-45deg, rgba(214, 175, 55, 0.08) 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, rgba(214, 175, 55, 0.08) 75%), 
            linear-gradient(-45deg, transparent 75%, rgba(214, 175, 55, 0.08) 75%);
          background-size: 32px 32px;
          background-position: 0 0, 0 16px, 16px -16px, -16px 0px;
          mask-image: radial-gradient(circle, black 60%, transparent 100%);
          -webkit-mask-image: radial-gradient(circle, black 60%, transparent 100%);
        }

        .text-glow-gold {
          text-shadow: 0 0 15px rgba(214, 175, 55, 0.4);
        }
        .text-glow-cyber {
          text-shadow: 0 0 15px rgba(56, 189, 248, 0.4);
        }

        /* Glassmorphism utility of Artistic Flair theme */
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .glass-dark {
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .glass-card-premium {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(214, 175, 55, 0.18);
        }

        /* Shimmering sweeping gold reflection animation */
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-25deg); }
          100% { transform: translateX(150%) skewX(-25deg); }
        }
        .animate-shimmer {
          position: relative;
          overflow: hidden;
        }
        .animate-shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(214, 175, 55, 0.25), transparent);
          transform: translateX(-100%);
          animation: shimmer 4s infinite linear;
          pointer-events: none;
        }

        /* Vinyl rotating disk */
        .vinyl-spin {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Dynamic countdown indicator dot */
        .countdown-dot {
          width: 6px;
          height: 6px;
          background: #D4AF37;
          border-radius: 50%;
          box-shadow: 0 0 10px #D4AF37;
          display: inline-block;
        }
      `}</style>

      {/* BACKGROUND GRAPHICS: Fluid Glowing Auras */}
      <div id="bg-aura-containers" className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Soft Colorful Orbs with scroll-driven movement */}
        <motion.div style={{ y: y1 }} className="orb-1 glow-orb" />
        <motion.div style={{ y: y2 }} className="orb-2 glow-orb" />
        <motion.div style={{ y: y3 }} className="orb-3 glow-orb" />
        
        {/* Star Sparkle Canvas */}
        <SparkleStarsCanvas />
      </div>

      {/* HEADER: Subtle branding */}
      <header id="app-header" className="relative z-40 w-full px-6 md:px-12 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-xs tracking-widest font-serif italic text-amber-200">JS</div>
          <div className="h-[1px] w-12 bg-white/20 hidden sm:block"></div>
          <span className="text-[10px] uppercase tracking-[0.4em] opacity-60 font-sans text-amber-100 hidden sm:block">{INVITATION.coupleShort} • {INVITATION.eventTitle}</span>
        </div>
        
        {/* Music vinyl widget (spinning 3D disc of Artistic Flair theme) */}
        <button 
          id="music-vinyl-widget"
          onClick={toggleAudio}
          className="group relative flex items-center gap-4 bg-transparent border-0 py-2 hover:opacity-90 transition-all duration-300"
          title="Musiqani yoqish/ochirish"
        >
          {isPlaying && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-20">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
            </span>
          )}

          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-widest opacity-40 font-sans">Musiqa</p>
            <p className="text-[12px] font-serif italic text-amber-200">
              {isPlaying ? 'Perfect — Ed Sheeran' : 'Musiqa oʻchirilgan'}
            </p>
          </div>
          
          <div className="relative">
            <div className={`w-12 h-12 rounded-full glass border border-white/20 flex items-center justify-center ${isPlaying ? 'vinyl-spin' : ''}`}>
              <div className="w-4 h-4 bg-[#0B0F19] rounded-full border border-white/40 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
              </div>
            </div>
          </div>
        </button>
      </header>

      {/* CORE EXPERIENCE SECTION */}
      <main id="app-main" className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col items-center justify-center">
        
        <AnimatePresence mode="wait">
          {/* STAGE 1: THE REVEAL (3D ENVELOPE) */}
          {openingState !== 'opened' && (
            <motion.div 
              key="envelope-stage"
              initial={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -40, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg flex flex-col items-center justify-center py-6"
            >
              
              {/* Rasmiy tanish banner — havola ochilganda darhol kimga tegishli ekanligi ko'rinadi */}
              <div className="w-full max-w-md mb-6 glass-card-premium rounded-2xl p-5 border border-amber-500/20 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-amber-400/80">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-[0.25em] font-sans">Rasmiy nikoh taklifnomasi</span>
                </div>
                <h2 className="font-serif text-2xl italic text-amber-100 text-glow-gold">{INVITATION.coupleShort}</h2>
                <p className="text-xs text-slate-400 font-sans">{INVITATION.eventTitle}</p>
                <div className="flex flex-wrap justify-center gap-3 text-[10px] text-slate-500 font-sans">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-amber-500/60" />{INVITATION.eventDate}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500/60" />{INVITATION.eventTime}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-500/60" />{INVITATION.venue}</span>
                </div>
              </div>

              <p className="text-amber-200 font-display text-sm tracking-[0.3em] uppercase text-center mb-6 text-glow-gold animate-[pulse_3s_infinite]">
                {guestName ? `— HURMATLI ${guestName.toUpperCase()}, SIZ TAKLIF ETILDINGIZ —` : '— SIZ TAKLIF ETILDINGIZ —'}
              </p>

              {/* 3D Envelope Container */}
              <div 
                id="digital-envelope" 
                ref={envelopeRef}
                className="perspective-2000 w-full aspect-[4/3] max-w-md relative select-none cursor-pointer group"
                onClick={openingState === 'closed' ? handleOpenEnvelope : undefined}
                onMouseMove={handleEnvMouseMove}
                onMouseLeave={handleEnvMouseLeave}
                onTouchMove={handleEnvTouchMove}
                onTouchEnd={handleEnvTouchEnd}
              >
                <div 
                  className="w-full h-full preserve-3d relative transition-transform duration-300 ease-out"
                  style={{
                    transform: openingState === 'opening' 
                      ? 'scale(1.05)' 
                      : `rotateX(${envTilt.x}deg) rotateY(${envTilt.y}deg)`,
                  }}
                >
                  
                  {/* ENVELOPE INNER BACKING (Visible when open) */}
                  <div className="absolute inset-0 bg-[#0f1422] rounded-2xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center p-8 overflow-hidden">
                    <div className="w-full h-full border border-amber-500/10 rounded-xl flex flex-col items-center justify-center">
                      <Heart className="w-8 h-8 text-amber-400/10 fill-amber-400/5 animate-pulse" />
                    </div>
                  </div>

                  {/* LETTER SLIDING OUT (Only rises during opening stage with gorgeous 3D pop) */}
                  <div 
                    className={`absolute top-4 left-4 right-4 bottom-4 bg-slate-900/95 rounded-xl border border-amber-500/30 p-6 flex flex-col items-center justify-between transition-all duration-[1200ms] ease-out ${
                      openingState === 'opening' 
                        ? 'opacity-100 z-10 shadow-2xl' 
                        : 'z-0 opacity-40'
                    }`}
                    style={{
                      transform: openingState === 'opening'
                        ? 'translate3d(0, -65%, 60px) rotateX(-12deg) scale(1.05)'
                        : 'translate3d(0, 0, 0) rotateX(0deg) scale(1)'
                    }}
                  >
                    <div className="flex flex-col items-center text-center space-y-2 mt-4">
                      <Sparkles className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                      <h4 className="font-serif text-lg tracking-wider text-amber-100 italic">Visol Oqshomi</h4>
                      <div className="w-8 h-[1px] bg-amber-500/30"></div>
                      <p className="text-xs text-slate-300">{INVITATION.coupleAmpersand}</p>
                    </div>
                    <span className="text-[10px] text-amber-400/60 uppercase tracking-[0.2em] mb-2 font-mono">Yuklanmoqda...</span>
                  </div>

                  {/* ENVELOPE BODY / COVER (Bottom half triangular fold over) */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-amber-500/20 shadow-2xl z-20 backface-hidden flex flex-col items-center justify-end p-8 overflow-hidden">
                    {/* Beautiful geometric patterns in background of envelope */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    
                    {/* SPECULAR GLARE EFFECT OVERLAY */}
                    <div 
                      className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-22"
                      style={{
                        background: `radial-gradient(circle at ${envGlare.x}% ${envGlare.y}%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 60%)`,
                        opacity: envGlare.opacity
                      }}
                    />

                    {/* Envelope fold overlays mimicking classical folds */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-slate-950/80 via-transparent to-transparent"></div>
                    <div className="absolute left-0 bottom-0 w-0 h-0 border-l-[180px] md:border-l-[210px] border-l-transparent border-b-[140px] md:border-b-[160px] border-b-slate-900/90 z-20"></div>
                    <div className="absolute right-0 bottom-0 w-0 h-0 border-r-[180px] md:border-r-[210px] border-r-transparent border-b-[140px] md:border-b-[160px] border-b-slate-900/90 z-20"></div>
                    <div className="absolute inset-x-0 bottom-0 h-0 border-x-[180px] md:border-x-[210px] border-x-transparent border-b-[110px] md:border-b-[130px] border-b-slate-950/95 z-21"></div>

                    {/* Golden Wax Seal with 3D Depth translation */}
                    <div 
                      className={`absolute top-[45%] left-1/2 z-30 transition-all duration-700 ease-out`}
                      style={{
                        transform: `translate3d(calc(-50% + ${envTilt.y * 0.4}px), calc(-50% + ${envTilt.x * -0.4}px), 40px) scale(${openingState === 'opening' ? 0 : 1}) rotate(${envTilt.y * 0.5}deg)`,
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-[0_10px_25px_rgba(214,175,55,0.4)] flex items-center justify-center border border-amber-300/30">
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-pulse"></div>
                        {/* Seal Crest */}
                        <div className="w-12 h-12 rounded-full border border-dashed border-amber-200/40 flex items-center justify-center font-serif text-slate-950 font-bold text-xl italic">
                          J&S
                        </div>
                      </div>
                    </div>

                    {/* Invitation Label / Recipients with 3D translation */}
                    <div 
                      className="relative z-30 w-full text-center pb-4 transition-transform duration-300 ease-out"
                      style={{
                        transform: `translate3d(${envTilt.y * 0.25}px, ${envTilt.x * -0.25}px, 20px)`,
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      <p className="text-[10px] text-slate-400 tracking-[0.2em] mb-1 uppercase font-sans font-light">Taklif etuvchilar</p>
                      <h3 className="font-serif text-xl text-amber-200 italic tracking-wide text-glow-gold">{INVITATION.coupleShort}</h3>
                      <p className="text-[9px] text-slate-500 tracking-widest uppercase mt-1">
                        {guestName ? `Hurmatli ${guestName} uchun` : 'Siz va oilangiz uchun'}
                      </p>
                    </div>
                  </div>

                  {/* ENVELOPE TOP FLAP (Folds back on open) */}
                  <div 
                    className={`absolute inset-x-0 top-0 h-1/2 bg-slate-900 origin-top rounded-t-2xl z-25 transition-transform duration-700 preserve-3d ${openingState === 'opening' ? 'rotate-x-180 z-0' : 'rotate-x-0'}`}
                    style={{
                      clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)',
                      borderBottom: '2px solid rgba(214, 175, 55, 0.3)'
                    }}
                  >
                    {/* Flap Outer Side */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 backface-hidden"></div>
                    {/* Flap Inner Side */}
                    <div className="absolute inset-0 bg-slate-950 scale-y-[-1] backface-hidden"></div>
                  </div>

                </div>
              </div>

              {/* Reveal CTA Button */}
              <button 
                id="open-envelope-btn"
                onClick={handleOpenEnvelope}
                disabled={openingState === 'opening'}
                className="mt-8 px-8 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold tracking-widest text-xs uppercase rounded-full shadow-[0_0_30px_rgba(214,175,55,0.25)] hover:shadow-[0_0_40px_rgba(214,175,55,0.4)] transition-all duration-300 transform active:scale-95 animate-shimmer flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{openingState === 'opening' ? 'Konvert ochilmoqda...' : 'Taklifnomani ochish'}</span>
              </button>

              <div className="mt-4 text-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                  Konvertni bosing yoki ochish tugmasini bosing
                </span>
              </div>

            </motion.div>
          )}

          {/* STAGE 2: MAIN INVITATION CONTENT (FULLY REVEALED) */}
          {openingState === 'opened' && (
            <motion.div 
              key="main-stage"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center"
            >
              
              {/* HERO INTRO CARD WITH 3D TILT PARALLAX */}
              <div 
                id="main-parallax-container"
                className="w-full max-w-4xl relative flex flex-col items-center mb-16 py-4 px-2"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Float Card wrapper to apply 3D transform */}
                <div 
                  ref={cardRef}
                  className="w-full glass-card-premium rounded-3xl p-8 md:p-14 relative flex flex-col items-center shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-500"
                  style={{
                    transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.01, 1.01, 1.01)`,
                    boxShadow: `0 ${30 + tilt.x * 2}px ${60 + Math.abs(tilt.x) * 3}px rgba(0, 0, 0, 0.6)`
                  }}
                >
                  {/* SPECULAR GLARE EFFECT OVERLAY */}
                  <div 
                    id="specular-glare"
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 60%)`,
                      opacity: glare.opacity
                    }}
                  />

                  {/* Concentric Golden Double Border */}
                  <div className="absolute inset-4 border border-amber-500/10 rounded-[1.5rem] pointer-events-none z-0"></div>
                  <div className="absolute inset-5 border border-dashed border-amber-500/15 rounded-[1.25rem] pointer-events-none z-0"></div>
                  
                  {/* Arabic/Oriental luxury repeating trellis pattern watermark */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none card-arabic-pattern z-0" />

                  {/* CARD DECORATIONS (Floating Gold Circles & Geometrics) */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
                  
                  {/* Intricate Gold corner designs & Artistic corner frames */}
                  <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-amber-500/25 rounded-tl-xl pointer-events-none z-0"></div>
                  <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-amber-500/25 rounded-tr-xl pointer-events-none z-0"></div>
                  <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-amber-500/25 rounded-bl-xl pointer-events-none z-0"></div>
                  <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-amber-500/25 rounded-br-xl pointer-events-none z-0"></div>
                  
                  {/* Top-right corner accent line of Artistic Flair theme */}
                  <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-white/10 m-8 pointer-events-none"></div>

                  {/* PARALLAX LAYER 1: Deep Background Element */}
                  <div 
                    className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none select-none transition-transform duration-500 ease-out"
                    style={{ transform: `translate3d(${tilt.y * -0.5}px, ${tilt.x * -0.5}px, -50px)` }}
                  >
                    <Heart className="w-96 h-96 text-amber-200 fill-amber-200/10" />
                  </div>

                  {/* Floral Gold Ornament at the bottom right with counter-parallax */}
                  <div 
                    className="absolute bottom-8 right-8 opacity-[0.08] pointer-events-none transition-transform duration-500 ease-out"
                    style={{ transform: `translate3d(${tilt.y * -0.3}px, ${tilt.x * -0.3}px, -20px)` }}
                  >
                     <img 
                       src="https://upload.wikimedia.org/wikipedia/commons/d/d4/Gold_floral_ornament.png" 
                       className="w-32 brightness-200 grayscale" 
                       alt="Floral ornament decoration" 
                       referrerPolicy="no-referrer"
                     />
                  </div>

                  {/* PARALLAX LAYER 2: Main Text Content */}
                  <div 
                    className="relative z-10 w-full flex flex-col items-center text-center transition-transform duration-500 ease-out"
                    style={{ transform: `translate3d(${tilt.y * 0.4}px, ${tilt.x * 0.4}px, 30px)` }}
                  >
                    {/* Ring Emblem with Foreground Parallax */}
                    <div 
                      className="w-14 h-14 rounded-full border border-amber-500/30 flex items-center justify-center mb-6 bg-slate-950/50 backdrop-blur transition-transform duration-500 ease-out"
                      style={{ transform: `translate3d(${tilt.y * 0.15}px, ${tilt.x * 0.15}px, 45px)` }}
                    >
                      <Heart className="w-6 h-6 text-[#D4AF37] fill-amber-400/10 animate-[pulse_3s_infinite]" />
                    </div>

                    {/* Subtitle */}
                    <p className="text-[12px] uppercase tracking-[0.5em] text-[#D4AF37] mb-8 font-sans">Taklifnoma</p>
                    
                    {/* Couple Names - Elegant Cormorant Garamond Serif Italic with forward Parallax */}
                    <h1 
                      className="text-5xl md:text-7xl font-serif leading-[1] mb-6 italic text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-amber-300 text-glow-gold transition-transform duration-500 ease-out"
                      style={{ transform: `translate3d(${tilt.y * 0.25}px, ${tilt.x * 0.25}px, 60px)` }}
                    >
                      Jasur <br className="hidden md:inline" /> & Shahlo
                    </h1>

                    {/* Elegant flourish dividers with pulsing sparkles */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-[#D4AF37]/50" />
                      <Sparkles className="w-5 h-5 text-amber-400 animate-[pulse_2s_infinite]" />
                      <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-[#D4AF37]/50" />
                    </div>

                    {/* Immersive Audio Visual Equalizer (Bounces dynamically when playing music) */}
                    <div className="flex items-end justify-center gap-1.5 h-6 mb-8 bg-black/20 px-4 py-2.5 rounded-full border border-white/5 backdrop-blur-sm">
                      <span className="text-[9px] uppercase tracking-widest text-amber-400/60 font-mono mr-1 flex items-center">
                        <Music className="w-3 h-3 mr-1 animate-pulse" /> Live Wave:
                      </span>
                      {EQUALIZER_BARS.map((bar) => (
                        <motion.div
                          key={bar.id}
                          className="w-1 bg-gradient-to-t from-amber-600 to-yellow-300 rounded-full"
                          animate={{
                            height: isPlaying ? bar.heights : 2
                          }}
                          transition={{
                            duration: bar.duration,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>

                    {/* Warm Invitation Text */}
                    <p className="max-w-xl text-slate-300 text-sm md:text-base leading-relaxed mb-10 font-light font-sans">
                      {"Aziz va qadrli mehmonimiz! Sizni hayotimizdagi eng unutilmas va maxsus quvonchli kunimiz — "}
                      <strong className="text-amber-200 font-semibold font-serif italic">{"Nikoh Visol Oqshomimizga"}</strong>
                      {" lutfan taklif etamiz. Sizning ishtirokingiz davramizga yanada fayz va shukuh bag'ishlaydi."}
                    </p>

                    {/* Quick Date-Venue Grid with foreground Parallax */}
                    <div 
                      className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl mt-4 transition-transform duration-500 ease-out"
                      style={{ transform: `translate3d(${tilt.y * 0.1}px, ${tilt.x * 0.1}px, 15px)` }}
                    >
                      
                      {/* Date Block */}
                      <div className="flex flex-col items-center p-5 rounded-2xl bg-slate-950/40 border border-slate-800/60 backdrop-blur-sm">
                        <div className="p-3 rounded-xl bg-amber-500/10 mb-3 text-amber-400">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Sana</span>
                        <span className="text-sm font-semibold text-amber-100">19-Sentabr, 2026</span>
                        <span className="text-xs text-slate-500 font-mono">Shanba</span>
                      </div>

                      {/* Time Block */}
                      <div className="flex flex-col items-center p-5 rounded-2xl bg-slate-950/40 border border-slate-800/60 backdrop-blur-sm">
                        <div className="p-3 rounded-xl bg-amber-500/10 mb-3 text-amber-400">
                          <Clock className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Boshlanish vaqti</span>
                        <span className="text-sm font-semibold text-amber-100">18:00</span>
                        <span className="text-xs text-slate-500 font-mono">Toshkent vaqti</span>
                      </div>

                      {/* Venue Block */}
                      <div className="flex flex-col items-center p-5 rounded-2xl bg-slate-950/40 border border-slate-800/60 backdrop-blur-sm">
                        <div className="p-3 rounded-xl bg-amber-500/10 mb-3 text-amber-400">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Manzil</span>
                        <span className="text-sm font-semibold text-amber-100 truncate w-full px-2 text-center">{"\"Versal\" Saroyi"}</span>
                        <span className="text-xs text-slate-500">{"Toshkent sh., Bobur ko'chasi"}</span>
                      </div>

                    </div>

                    {/* Infinite floating helper bubble */}
                    <div className="mt-8 flex items-center space-x-1.5 text-amber-400/60 text-[10px] uppercase tracking-widest animate-bounce">
                      <span>{"Sichqoncha yoki barmog'ingiz bilan 3D egishni sinang"}</span>
                    </div>

                  </div>
                </div>
              </div>

              {/* SECTION 2: DYNAMIC COUNTDOWN TIMER */}
              <div id="countdown-section" className="w-full max-w-4xl px-4 flex flex-col items-center mb-24">
                <div className="text-center mb-8">
                  <p className="text-[10px] uppercase tracking-[0.3em] opacity-60 mb-3 flex items-center gap-3 justify-center text-amber-200/90 font-sans">
                    <span className="countdown-dot"></span> Tadbir boshlanishiga qolgan vaqt
                  </p>
                  <div className="w-12 h-1 bg-[#D4AF37]/30 mx-auto rounded-full"></div>
                </div>

                {timeLeft.isOver ? (
                  <div className="glass-dark rounded-3xl px-12 py-8 text-center shadow-lg border border-[#D4AF37]/30">
                    <span className="text-lg font-serif italic text-amber-200 uppercase tracking-widest">
                      Tadbir boshlandi! Xush kelibsiz! 🎉
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-3xl perspective-2000">
                    
                    {/* Days Column */}
                    <motion.div 
                      initial={{ opacity: 0, y: 40, rotateX: 20 }}
                      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.0 }}
                      whileHover={{ 
                        scale: 1.05, 
                        rotateX: -10, 
                        rotateY: 5, 
                        translateZ: 15,
                        borderColor: "rgba(212, 175, 55, 0.4)",
                        boxShadow: "0 20px 40px rgba(212, 175, 55, 0.12)"
                      }}
                      className="glass-dark rounded-3xl p-6 md:p-8 flex flex-col items-center shadow-xl border border-white/5 transition-colors duration-300 group cursor-pointer"
                    >
                      <div className="text-4xl md:text-5xl font-serif text-[#D4AF37] text-glow-gold group-hover:scale-110 transition-transform duration-300 leading-none mb-2">
                        {String(timeLeft.days).padStart(2, '0')}
                      </div>
                      <span className="text-[10px] md:text-xs uppercase tracking-widest opacity-40 font-sans">Kun</span>
                    </motion.div>

                    {/* Hours Column */}
                    <motion.div 
                      initial={{ opacity: 0, y: 40, rotateX: 20 }}
                      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
                      whileHover={{ 
                        scale: 1.05, 
                        rotateX: -10, 
                        rotateY: 5, 
                        translateZ: 15,
                        borderColor: "rgba(212, 175, 55, 0.4)",
                        boxShadow: "0 20px 40px rgba(212, 175, 55, 0.12)"
                      }}
                      className="glass-dark rounded-3xl p-6 md:p-8 flex flex-col items-center shadow-xl border border-white/5 transition-colors duration-300 group cursor-pointer"
                    >
                      <div className="text-4xl md:text-5xl font-serif text-[#D4AF37] text-glow-gold group-hover:scale-110 transition-transform duration-300 leading-none mb-2">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </div>
                      <span className="text-[10px] md:text-xs uppercase tracking-widest opacity-40 font-sans">Soat</span>
                    </motion.div>

                    {/* Minutes Column */}
                    <motion.div 
                      initial={{ opacity: 0, y: 40, rotateX: 20 }}
                      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
                      whileHover={{ 
                        scale: 1.05, 
                        rotateX: -10, 
                        rotateY: 5, 
                        translateZ: 15,
                        borderColor: "rgba(212, 175, 55, 0.4)",
                        boxShadow: "0 20px 40px rgba(212, 175, 55, 0.12)"
                      }}
                      className="glass-dark rounded-3xl p-6 md:p-8 flex flex-col items-center shadow-xl border border-white/5 transition-colors duration-300 group cursor-pointer"
                    >
                      <div className="text-4xl md:text-5xl font-serif text-[#D4AF37] text-glow-gold group-hover:scale-110 transition-transform duration-300 leading-none mb-2">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </div>
                      <span className="text-[10px] md:text-xs uppercase tracking-widest opacity-40 font-sans">Daqiqa</span>
                    </motion.div>

                    {/* Seconds Column */}
                    <motion.div 
                      initial={{ opacity: 0, y: 40, rotateX: 20 }}
                      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}
                      whileHover={{ 
                        scale: 1.05, 
                        rotateX: -10, 
                        rotateY: 5, 
                        translateZ: 15,
                        borderColor: "rgba(212, 175, 55, 0.4)",
                        boxShadow: "0 20px 40px rgba(212, 175, 55, 0.12)"
                      }}
                      className="glass-dark rounded-3xl p-6 md:p-8 flex flex-col items-center shadow-xl border border-white/5 transition-colors duration-300 group cursor-pointer"
                    >
                      <div className="text-4xl md:text-5xl font-serif text-[#D4AF37] text-glow-gold group-hover:scale-110 transition-transform duration-300 leading-none mb-2">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </div>
                      <span className="text-[10px] md:text-xs uppercase tracking-widest opacity-40 font-sans">Soniya</span>
                    </motion.div>

                  </div>
                )}
              </div>

              {/* SECTION 3: INTERACTIVE RSVP FORM */}
              <div id="rsvp-section" className="w-full max-w-3xl px-4 flex flex-col items-center mb-24 scroll-mt-20">
                <div className="text-center mb-8">
                  <p className="text-[10px] uppercase tracking-[0.3em] opacity-60 mb-2 font-sans text-amber-200">Ishtirokingizni tasdiqlang</p>
                  <h3 className="font-serif text-2xl tracking-[0.15em] text-[#D4AF37] italic uppercase mb-2">Kelishni tasdiqlash</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-light">
                    {"Tashrifingizni tasdiqlashingiz biz uchun juda muhim, iltimos ushbu formani to'ldiring:"}
                  </p>
                  <div className="w-12 h-[1px] bg-[#D4AF37]/30 mx-auto rounded-full mt-3"></div>
                </div>

                <AnimatePresence mode="wait">
                  {!rsvpSaved ? (
                    <motion.form 
                      key="rsvp-form"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      onSubmit={handleRsvpSubmit}
                      className="w-full glass-dark rounded-[2rem] p-8 md:p-12 border border-white/5 shadow-2xl space-y-6"
                    >
                      {/* Name Input */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.3em] opacity-60 font-sans text-amber-200" htmlFor="mehmon-ismi">
                          Ismingiz va Familiyangiz *
                        </label>
                        <input 
                          id="mehmon-ismi"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Masalan: Shavkat Alimov"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-amber-100 placeholder:opacity-30 focus:outline-none focus:border-[#D4AF37] transition-all duration-300 font-medium"
                        />
                      </div>

                      {/* Guest Count Selector */}
                      <div className="flex flex-col space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase tracking-[0.3em] opacity-60 font-sans text-amber-200">
                            Siz bilan necha kishi keladi?
                          </label>
                          <span className="text-xs font-serif italic font-bold text-[#D4AF37] bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                            {guestCount} kishi
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 bg-black/40 rounded-xl p-1 border border-white/5">
                          <button
                            type="button"
                            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                            className="w-11 h-11 flex items-center justify-center text-lg font-bold text-slate-400 hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-all duration-200"
                          >
                            -
                          </button>
                          <div className="flex-grow flex justify-center text-sm font-semibold text-slate-300 font-sans">
                            Hamrohlikda: {guestCount - 1} kishi
                          </div>
                          <button
                            type="button"
                            onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
                            className="w-11 h-11 flex items-center justify-center text-lg font-bold text-slate-400 hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-all duration-200"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Presence Choice */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.3em] opacity-60 font-sans text-amber-200">
                          Ishtirok etasizmi? *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Attend option */}
                          <button
                            type="button"
                            onClick={() => setStatus('will_attend')}
                            className={`flex items-center justify-center space-x-3 rounded-xl px-5 py-4 text-sm font-semibold border transition-all duration-300 ${status === 'will_attend' ? 'bg-[#D4AF37] text-slate-950 border-[#D4AF37]' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'}`}
                          >
                            <span className="text-lg">💖</span>
                            <span>Ishtirok etaman</span>
                          </button>

                          {/* Cannot Attend option */}
                          <button
                            type="button"
                            onClick={() => setStatus('cannot_attend')}
                            className={`flex items-center justify-center space-x-3 rounded-xl px-5 py-4 text-sm font-semibold border transition-all duration-300 ${status === 'cannot_attend' ? 'bg-white/10 border-white/20 text-slate-200' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'}`}
                          >
                            <span className="text-lg">😔</span>
                            <span>Kelolmayman</span>
                          </button>
                        </div>
                      </div>

                      {/* Wishing / Message Box */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.3em] opacity-60 font-sans text-amber-200" htmlFor="mehmon-tilak">
                          Ezgu tilaklaringiz (ixtiyoriy)
                        </label>
                        <textarea
                          id="mehmon-tilak"
                          rows={3}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Kuyov-kelinchakka o'z tilaklaringizni yozib qoldiring..."
                          className="w-full bg-white/5 border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-sm text-amber-100 placeholder:opacity-30 focus:outline-none transition-all duration-300 resize-none font-medium"
                        />
                      </div>

                      {/* Submit CTA */}
                      <button
                        type="submit"
                        disabled={isSubmitting || !status || !name.trim()}
                        className="w-full py-4 bg-white hover:bg-[#D4AF37] disabled:bg-white/5 disabled:text-white/20 text-[#0B0F19] font-sans text-xs uppercase tracking-widest font-semibold rounded-xl transition-all duration-500 transform active:scale-98 animate-shimmer flex items-center justify-center space-x-2"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>RSVP Tasdiqlash</span>
                          </>
                        )}
                      </button>

                    </motion.form>
                  ) : (
                    <motion.div 
                      key="rsvp-success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full glass-dark rounded-[2rem] p-8 border border-[#D4AF37]/30 shadow-2xl text-center space-y-6"
                    >
                      <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto text-[#D4AF37] animate-pulse">
                        <Check className="w-8 h-8" />
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-serif text-2xl italic text-[#D4AF37]">Muvaffaqiyatli saqlandi!</h4>
                        <p className="text-sm text-slate-300 font-light font-sans">
                          {rsvpSaved.status === 'will_attend' ? (
                            <span>Tashrifingiz tasdiqlandi. Nikoh oqshomimizda sizni kutib qolamiz! 💖</span>
                          ) : (
                            <span>Xabaringiz yetkazildi. Afsusdamiz, ammo tilaklaringiz uchun minnatdormiz! ✨</span>
                          )}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-left space-y-3 max-w-md mx-auto text-xs font-sans">
                        <div className="flex justify-between border-b border-white/10 pb-2">
                          <span className="text-slate-500">Mehmon ismi:</span>
                          <span className="font-bold text-amber-200">{rsvpSaved.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2">
                          <span className="text-slate-500">Mehmonlar soni:</span>
                          <span className="font-bold text-slate-300">{rsvpSaved.guestCount} kishi</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2">
                          <span className="text-slate-500">Holat:</span>
                          <span className={`font-semibold ${rsvpSaved.status === 'will_attend' ? 'text-green-400' : 'text-slate-400'}`}>
                            {rsvpSaved.status === 'will_attend' ? 'Ishtirok etadi' : 'Kela olmaydi'}
                          </span>
                        </div>
                        {rsvpSaved.message && (
                          <div className="pt-1">
                            <span className="text-slate-500 block mb-1">Qoldirilgan tilak:</span>
                            <p className="text-slate-300 font-light italic bg-black/30 p-2 rounded border border-white/5">{rsvpSaved.message}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 justify-center pt-2 font-sans">
                        <button
                          onClick={handleResetForm}
                          className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-all duration-200"
                        >
                          {"Ma'lumotlarni o'zgartirish"}
                        </button>
                        <button
                          onClick={() => setShowGuestList(!showGuestList)}
                          className="px-5 py-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all duration-200 flex items-center justify-center space-x-1.5"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{showGuestList ? "Ro'yxatni berkitish" : "Ro'yxatni ko'rish"}</span>
                        </button>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>

                {/* SHOW GUEST LIST MODAL / FOLDER (For testing of RSVP) */}
                <div className="mt-4 w-full flex justify-center">
                  {!rsvpSaved && allRsvps.length > 0 && (
                    <button
                      onClick={() => setShowGuestList(!showGuestList)}
                      className="px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-medium text-amber-300 hover:text-amber-200 transition"
                    >
                      {showGuestList ? "Mehmonlar ro'yxatini yopish ✕" : `Barcha yuborilgan RSVPlarni ko'rish (${allRsvps.length}) ➔`}
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showGuestList && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="w-full mt-6 overflow-hidden transition-all duration-300"
                    >
                      <div className="glass-panel rounded-2xl p-5 md:p-6 border border-slate-800 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                          <h4 className="font-display text-sm text-amber-200 uppercase tracking-widest flex items-center space-x-1.5">
                            <CalendarCheck className="w-4 h-4 text-amber-400" />
                            <span>Mehmonlar Tasdiqlari ({allRsvps.length})</span>
                          </h4>
                          <span className="text-[10px] bg-slate-950 px-2 py-1 rounded text-slate-400">Local Storage</span>
                        </div>

                        {allRsvps.length === 0 ? (
                          <div className="text-center py-6 text-slate-500 text-xs">
                            {"Hozircha yuborilgan tasdiqlar yo'q. Birinchi bo'lib qo'shing!"}
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {allRsvps.map((rsvp) => (
                              <div key={rsvp.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-900 flex justify-between items-start space-x-4">
                                <div className="space-y-1 flex-grow">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-xs text-amber-100">{rsvp.name}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono leading-none ${rsvp.status === 'will_attend' ? 'bg-green-500/10 text-green-400 border border-green-500/15' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                                      {rsvp.status === 'will_attend' ? 'Ishtirok etadi' : 'Kela olmaydi'}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                                    <Users className="w-3 h-3 text-amber-500/40" />
                                    <span>Mehmonlar soni: {rsvp.guestCount} kishi</span>
                                    <span>•</span>
                                    <span>{rsvp.submittedAt}</span>
                                  </div>
                                  {rsvp.message && (
                                    <p className="text-[11px] text-slate-400 italic bg-slate-900/50 p-2 rounded border border-slate-800/20 mt-1">
                                      {"\""}{rsvp.message}{"\""}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleDeleteRsvp(rsvp.id)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                  title="Ochirish"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* SECTION 4: LOCATION & NAVIGATION (INTERACTIVE MAP) */}
              <div id="map-section" className="w-full max-w-4xl px-4 flex flex-col items-center mb-16">
                <div className="text-center mb-8">
                  <p className="text-[10px] uppercase tracking-[0.3em] opacity-60 mb-2 font-sans text-amber-200">Manzilimiz va Xarita</p>
                  <h3 className="font-serif text-2xl tracking-[0.15em] text-[#D4AF37] italic uppercase mb-2">Tadbir manzili xaritasi</h3>
                  <div className="w-12 h-[1px] bg-[#D4AF37]/30 mx-auto rounded-full mt-3"></div>
                </div>

                <div className="w-full glass-dark rounded-[2rem] p-4 border border-white/5 shadow-2xl overflow-hidden flex flex-col space-y-4">
                  {/* Google Map iframe with clean glass filter frame */}
                  <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-white/10">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2997.5562031175624!2d69.2486127!3d41.2967115!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b0e7742cb6b%3A0xc669ef070bf31c93!2zIkFtaXIgVGVtdXIgU3F1YXJlIg!5e0!3m2!1sen!2suz!4v1700000000000!5m2!1sen!2suz" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0, filter: 'grayscale(0.7) invert(0.9) contrast(1.2)' }} 
                      allowFullScreen={false} 
                      loading="lazy" 
                      referrerPolicy="no-referrer"
                      title="Versal Saroyi Google Xaritasi"
                    />
                    
                    {/* Glowing coordinate pin decoration */}
                    <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur border border-white/10 rounded-lg px-3 py-1.5 flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_1.5s_infinite]"></span>
                      <span>41.2967° N, 69.2486° E</span>
                    </div>
                  </div>

                  {/* Address card & Route button */}
                  <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 bg-black/40 rounded-xl border border-white/5">
                    <div className="flex items-start space-x-3">
                      <div className="p-2.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] mt-0.5">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif font-bold text-base text-[#D4AF37] italic">{"\"Versal\" Tantanalar Saroyi"}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-light font-sans">
                          {"Toshkent shahri, Bobur ko'chasi, 23-uy. Mo'ljal: Bobur bog'i ro'parasi."}
                        </p>
                      </div>
                    </div>
                    
                    <a 
                      href="https://maps.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-white hover:bg-[#D4AF37] text-slate-950 text-xs font-semibold tracking-wider uppercase rounded-xl transition duration-500 flex items-center space-x-2 self-stretch md:self-auto justify-center"
                    >
                      <Map className="w-3.5 h-3.5" />
                      <span>Xaritada ochish</span>
                      <ExternalLink className="w-3 h-3 text-slate-950" />
                    </a>
                  </div>

                </div>
              </div>

              {/* FOOTER EMBELLISHMENT */}
              <div className="text-center py-10 opacity-60 flex flex-col items-center space-y-2 font-sans">
                <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]/20" />
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]">Jasur & Shahlo</p>
                <p className="text-[9px] text-slate-500">Nikoh Visoli • 2026</p>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* COMPACT FLOATING MUSIC & TOP HELP NAVIGATION */}
      {openingState === 'opened' && (
        <div className="fixed bottom-6 left-6 z-40 flex flex-col space-y-3">
          {/* Scroll to RSVP Quick Trigger */}
          <button
            onClick={() => {
              const el = document.getElementById('rsvp-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-full shadow-[0_4px_20px_rgba(214,175,55,0.35)] hover:shadow-[0_4px_30px_rgba(214,175,55,0.5)] transition duration-300 transform hover:scale-110 active:scale-95"
            title="Kelishni tasdiqlashga tushish"
          >
            <CalendarCheck className="w-5 h-5 font-bold" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * High-performance scroll-driven parallax canvas background
 * featuring sparkling stars, drifting gold dust, and elegant gold wedding petals.
 */
function SparkleStarsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle schema
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      angle: number;
      spin: number;
      opacity: number;
      type: 'star' | 'petal' | 'dust';
      depth: number; // Parallax speed multiplier
    }

    const particles: Particle[] = [];
    const count = 90; // rich but highly optimized

    for (let i = 0; i < count; i++) {
      const typeRand = Math.random();
      let type: 'star' | 'petal' | 'dust' = 'star';
      let depth = Math.random() * 0.4 + 0.1; // background stars default

      if (typeRand > 0.82) {
        type = 'petal';
        depth = Math.random() * 0.4 + 0.5; // petals have more scroll action
      } else if (typeRand > 0.6) {
        type = 'dust';
        depth = Math.random() * 0.3 + 0.3;
      }

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: type === 'petal' ? Math.random() * 6 + 4 : type === 'dust' ? Math.random() * 2 + 1 : Math.random() * 1.5 + 0.5,
        speedY: type === 'petal' ? Math.random() * 0.6 + 0.2 : type === 'dust' ? Math.random() * 0.3 + 0.1 : 0,
        speedX: Math.random() * 0.4 - 0.2,
        angle: Math.random() * Math.PI * 2,
        spin: Math.random() * 0.02 - 0.01,
        opacity: Math.random() * 0.6 + 0.4,
        type,
        depth
      });
    }

    // Scroll Tracking variables
    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth easing of scroll
      currentScrollY += (targetScrollY - currentScrollY) * 0.08;

      particles.forEach((p) => {
        // Animation update
        if (p.type === 'petal' || p.type === 'dust') {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.angle) * 0.1;
          p.angle += p.spin;
        } else {
          p.angle += p.spin * 0.5;
          p.opacity = 0.3 + Math.sin(p.angle) * 0.4;
        }

        // Screen boundary wrapping (X axis)
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        // Screen boundary wrapping (Y axis)
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Calculate scroll parallax position
        let drawY = (p.y + currentScrollY * p.depth) % height;
        if (drawY < 0) drawY += height;

        ctx.save();
        if (p.type === 'petal') {
          // Draw elegant luxury golden petal
          ctx.translate(p.x, drawY);
          ctx.rotate(p.angle);
          ctx.beginPath();
          
          // Royal Leaf/Petal curves
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size * 1.2, -p.size * 1.2, p.size, 0);
          ctx.quadraticCurveTo(p.size, p.size * 1.2, 0, p.size);
          ctx.quadraticCurveTo(-p.size, p.size * 1.2, -p.size, 0);
          ctx.quadraticCurveTo(-p.size * 1.2, -p.size * 1.2, 0, -p.size);

          const grad = ctx.createLinearGradient(-p.size, -p.size, p.size, p.size);
          grad.addColorStop(0, '#FFF5D0'); // Champagne Gold highlight
          grad.addColorStop(0.5, '#D4AF37'); // Classic Gold
          grad.addColorStop(1, '#A07812'); // Rich deep gold

          ctx.fillStyle = grad;
          ctx.shadowColor = 'rgba(214, 175, 55, 0.4)';
          ctx.shadowBlur = 6;
          ctx.fill();
        } else if (p.type === 'dust') {
          // Glowing gold/champagne dust particles
          ctx.beginPath();
          ctx.arc(p.x, drawY, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(214, 175, 55, ${p.opacity * 0.5})`;
          ctx.shadowColor = 'rgba(214, 175, 55, 0.6)';
          ctx.shadowBlur = 4;
          ctx.fill();
        } else {
          // Star
          ctx.translate(p.x, drawY);
          ctx.rotate(p.angle);

          if (p.size > 1.2) {
            // Draw majestic 4-point star
            ctx.beginPath();
            ctx.moveTo(0, -p.size * 2);
            ctx.quadraticCurveTo(0, 0, p.size * 2, 0);
            ctx.quadraticCurveTo(0, 0, 0, p.size * 2);
            ctx.quadraticCurveTo(0, 0, -p.size * 2, 0);
            ctx.quadraticCurveTo(0, 0, 0, -p.size * 2);
            ctx.fillStyle = `rgba(255, 253, 240, ${p.opacity * 0.85})`;
            ctx.shadowColor = 'rgba(214, 175, 55, 0.4)';
            ctx.shadowBlur = 5;
            ctx.fill();
          } else {
            // Circle star
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 253, 240, ${p.opacity * 0.65})`;
            ctx.fill();
          }
        }
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Resize observer
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none opacity-80" 
    />
  );
}
