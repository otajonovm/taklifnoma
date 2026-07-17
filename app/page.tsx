'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Calendar, 
  Clock, 
  MapPin, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Sparkles, 
  Navigation,
  Map,
  BookOpen,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WeddingInvitation() {
  // Primary active page state (0 to 6)
  const [activePage, setActivePage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);

  // Derive spread for desktop view
  const currentSpread = activePage === 0 ? 0 : Math.ceil(activePage / 2);
  const totalSpreads = 3;

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false
  });

  // RSVP Form State
  const [guestName, setGuestName] = useState('');
  const [isAttending, setIsAttending] = useState<boolean | null>(null);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Measure screen for responsive scaling and mobile view detection.
  // Mobile scales to a single page (425px), not the full 850px spread — otherwise the card looks tiny.
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobileSize = width < 768;
      setIsMobile(isMobileSize);

      const BOOK_W = 850;
      const PAGE_W = 425;
      const BOOK_H = 550;

      if (isMobileSize) {
        const availableW = width - 20;
        const availableH = height - 175; // header + nav + safe padding
        const nextScale = Math.min(availableW / PAGE_W, availableH / BOOK_H);
        setScale(Math.min(Math.max(nextScale, 0.72), 1.08));
      } else if (width < 900) {
        setScale(Math.max(0.55, (width - 32) / BOOK_W));
      } else {
        setScale(1);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize Audio
  useEffect(() => {
    const audioUrl = '/oh-sevaman-yor.mp3';
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = 0.5;
    
    audio.addEventListener('canplaythrough', () => {
      setAudioLoaded(true);
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Sync isPlaying state with Audio element
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.log("Autoplay was blocked by browser. Playing on next click.", err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Audio toggler
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Safe starter that triggers when book is opened (circumvents autoplay block)
  const startMusicOnInteraction = () => {
    if (audioRef.current && !isPlaying) {
      setIsPlaying(true);
    }
  };

  // Countdown timer calculations till August 13, 2026 18:00 (UTC+5 / Tashkent time)
  useEffect(() => {
    const targetDate = new Date("2026-08-13T18:00:00+05:00");

    const updateTimer = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  // Flipping controls: mobile turns one page at a time; desktop turns full spreads.
  const maxPage = 6;

  const nextPage = () => {
    startMusicOnInteraction();
    if (isMobile) {
      if (activePage < maxPage) setActivePage(activePage + 1);
      return;
    }
    if (currentSpread < totalSpreads) {
      setActivePage(currentSpread * 2 + 1);
    }
  };

  const prevPage = () => {
    if (isMobile) {
      if (activePage > 0) setActivePage(activePage - 1);
      return;
    }
    if (currentSpread > 0) {
      if (currentSpread === 1) {
        setActivePage(0);
      } else {
        setActivePage((currentSpread - 2) * 2 + 1);
      }
    }
  };

  // Center the active page in the viewport (mobile shows one page; desktop centers the cover/spread).
  const bookTranslateX = isMobile
    ? (activePage % 2 === 0 ? 'translateX(-25%)' : 'translateX(25%)')
    : (currentSpread === 0 ? 'translateX(-25%)' : 'translateX(0)');

  // RSVP Form submission handler
  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setFormError("Iltimos, ismingizni kiriting.");
      return;
    }
    if (isAttending === null) {
      setFormError("Iltimos, tashrifingizni tasdiqlang.");
      return;
    }

    setFormError('');
    setRsvpSubmitted(true);

    if (isAttending) {
      // Shimmer gold confetti shower
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFF6D6', '#F5D061', '#D4AF37', '#AA771C']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FFF6D6', '#F5D061', '#D4AF37', '#AA771C']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  };

  // Helper function to handle opening Google Maps
  const openMap = () => {
    window.open("https://maps.app.goo.gl/hwoUh9EFxbAZdj1D8", "_blank");
  };

  // ==================== RENDERING INDIVIDUAL PAGES ====================

  // ==================== RENDERING INDIVIDUAL PAGES ====================

  const renderCover = (isMobileView: boolean = false) => (
    <div
      className={`book-page-side book-page-front cover-page border-r border-[#D4AF37]/40 ${isMobileView ? 'rounded-xl h-full' : 'rounded-r-xl h-full'} flex flex-col justify-between ${isMobileView ? 'p-6' : 'p-8'} text-center relative w-full`}
      id="page-1-front"
      style={{ left: -2, top: 1 }}
    >
      {/* Gold frames */}
      <div className="absolute inset-4 border border-[#D4AF37]/30 rounded-lg pointer-events-none"></div>
      <div className="absolute inset-5 border border-[#D4AF37]/10 rounded-md pointer-events-none"></div>
      
      {/* Corner Ornaments */}
      <div className="ornament-corner ornament-tl" style={{ borderColor: '#D4AF37' }}></div>
      <div className="ornament-corner ornament-tr" style={{ borderColor: '#D4AF37' }}></div>
      <div className="ornament-corner ornament-bl" style={{ borderColor: '#D4AF37' }}></div>
      <div className="ornament-corner ornament-br" style={{ borderColor: '#D4AF37' }}></div>

      <div className={`mt-4 flex flex-col items-center`}>
        <div className={`w-14 h-14 rounded-full border border-[#D4AF37]/50 flex items-center justify-center ${isMobileView ? 'mb-2' : 'mb-4'} bg-[#D4AF37]/5 shadow-[0_0_20px_rgba(212,175,55,0.05)]`}>
          <span className="font-display text-2xl font-bold text-gold-gradient tracking-widest pl-1">HM</span>
        </div>
        <p className="font-display tracking-[0.3em] text-[10px] text-[#D4AF37] font-semibold uppercase mb-2">
          Taklifnoma
        </p>
        
        {/* Divider */}
        <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent mb-4"></div>
      </div>

      <div className="my-auto px-2">
        <h1 className={`${isMobileView ? 'text-3xl' : 'text-4xl'} font-semibold text-gold-gradient tracking-wide mb-2 leading-tight`}>
          Hamidullo
        </h1>
        <p className="font-serif text-lg italic text-[#D4AF37]/70 my-1">&amp;</p>
        <h1 className={`${isMobileView ? 'text-3xl' : 'text-4xl'} font-semibold text-gold-gradient tracking-wide mt-2 leading-tight`}>
          Muborakhon
        </h1>
      </div>

      <div className="mb-4 flex flex-col items-center gap-2 z-10">
        <p className="font-serif text-[10px] tracking-wider text-amber-200/50">
          Nikoh marosimi taklifnomasi
        </p>
        <button 
          id="open-invite-btn"
          onClick={(e) => { e.stopPropagation(); nextPage(); }}
          className="group relative flex items-center gap-2 bg-[#D4AF37] hover:bg-[#FDFBF7] text-black font-bold border-2 border-[#D4AF37] hover:text-[#D4AF37] shadow-[0_4px_15px_rgba(212,175,55,0.4)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.6)] px-5 py-2 rounded-full text-[11px] font-display tracking-widest transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <BookOpen size={12} className="text-black group-hover:text-[#D4AF37] group-hover:rotate-12 transition-transform duration-300" />
          TAKLIFNOMANI OCHISH
          <ChevronRight size={13} className="text-black group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );

  const renderQuote = (isMobileView: boolean = false) => (
    <div className={`book-page-side book-page-back paper-page ${isMobileView ? 'rounded-xl h-full' : 'rounded-l-xl h-full'} flex flex-col justify-between ${isMobileView ? 'p-6' : 'p-8'} text-center relative w-full`} id="page-1-back">
      {/* Book depth shadow */}
      {!isMobileView && <div className="absolute inset-y-0 left-0 w-16 inner-shadow-left pointer-events-none opacity-20"></div>}
      
      {/* Gold frames */}
      <div className="absolute inset-4 border border-[#D4AF37]/15 rounded-lg pointer-events-none"></div>

      <div className="mt-4 flex justify-center">
        <Heart size={18} className="text-[#D4AF37]/60 fill-[#D4AF37]/5" />
      </div>

      <div className="my-auto px-4 flex flex-col gap-4">
        <p className="font-serif text-gray-800 text-[12px] leading-relaxed italic">
          &ldquo;Yaratgan zot sizlar sukunat topishingiz uchun o&apos;zlaringizdan juftlaringizni yaratdi va oralaringizda sevgi hamda mehr-shafqat uyg&apos;otdi.&rdquo;
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="h-[1px] w-4 bg-[#D4AF37]/30"></span>
          <span className="font-display text-[9px] tracking-[0.15em] text-[#D4AF37] font-semibold uppercase">Rum surasi, 21</span>
          <span className="h-[1px] w-4 bg-[#D4AF37]/30"></span>
        </div>
        
        <p className="font-serif text-[11px] leading-relaxed text-gray-600 mt-2 px-1">
          Ikki qalbning go&apos;zal rishtalar bilan bog&apos;lanayotgan ushbu baxt ostonasida, biz uchun eng qadrli bo&apos;lgan siz aziz insonni davramizda ko&apos;rishni istaymiz.
        </p>
      </div>

      <div className="mb-4">
        <span className="font-display text-[9px] tracking-widest text-[#D4AF37]/60 font-semibold">H &amp; M</span>
      </div>
    </div>
  );

  const renderInvitation = (isMobileView: boolean = false) => (
    <div className={`book-page-side book-page-front paper-page ${isMobileView ? 'rounded-xl h-full' : 'rounded-r-xl h-full'} flex flex-col justify-between ${isMobileView ? 'p-6' : 'p-8'} text-center relative w-full`} id="page-2-front">
      {/* Book depth shadow */}
      {!isMobileView && <div className="absolute inset-y-0 right-0 w-16 inner-shadow-right pointer-events-none opacity-20"></div>}

      {/* Gold frames */}
      <div className="absolute inset-4 border border-[#D4AF37]/15 rounded-lg pointer-events-none"></div>

      <div className="mt-4">
        <span className="font-display text-[9px] tracking-[0.2em] text-[#D4AF37] uppercase border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/5 font-semibold">
          Taklifnoma
        </span>
      </div>

      <div className="my-auto px-2 flex flex-col gap-4">
        <h3 className="font-serif text-gray-800 text-[13px] font-bold tracking-wide">
          Hurmatli va aziz mehmonimiz!
        </h3>
        <p className="font-serif text-gray-600 text-[11px] leading-relaxed">
          Sizni farzandlarimiz quvonchli kunining go&apos;zal xotirasi munosabati bilan yoziladigan to&apos;y dasturxonimizda va baxt marosimida qadrli mehmonimiz bo&apos;lishga lutfan taklif etamiz.
        </p>
        
        <div className="flex flex-col gap-1 items-center justify-center my-1">
          <span className="font-display text-[9px] tracking-widest text-[#D4AF37] font-bold">Kelin &amp; Kuyov:</span>
          <span className="font-display text-lg text-gray-950 tracking-wide font-bold">Hamidullo &amp; Muborakhon</span>
        </div>

        <p className="font-serif text-[10px] leading-relaxed text-gray-500">
          Sizning tashrifingiz oilamiz uchun cheksiz quvonch va faxr ulashadi.
        </p>
      </div>

      <div className="mb-4">
        <p className="font-serif text-[9px] text-[#D4AF37] font-semibold tracking-wider">
          Hurmat bilan: Ota-onalar.
        </p>
      </div>
    </div>
  );

  const renderDetails = (isMobileView: boolean = false) => (
    <div className={`book-page-side book-page-back paper-page ${isMobileView ? 'rounded-xl h-full' : 'rounded-l-xl h-full'} flex flex-col justify-between ${isMobileView ? 'p-6' : 'p-8'} text-center relative w-full`} id="page-2-back">
      {/* Book depth shadow */}
      {!isMobileView && <div className="absolute inset-y-0 left-0 w-16 inner-shadow-left pointer-events-none opacity-20"></div>}

      {/* Gold frames */}
      <div className="absolute inset-4 border border-[#D4AF37]/15 rounded-lg pointer-events-none"></div>

      <div className="mt-4">
        <h4 className="font-display tracking-[0.2em] text-[9px] font-bold text-[#D4AF37] uppercase">
          Tadbir Tafsilotlari
        </h4>
        <div className="w-8 h-[1px] bg-[#D4AF37]/30 mx-auto mt-1"></div>
      </div>

      <div className="my-auto flex flex-col gap-4 px-2">
        {/* Date Grid */}
        <div className="grid grid-cols-2 gap-2" id="details-grid">
          <div className="flex items-center gap-2 bg-[#D4AF37]/5 border border-[#D4AF37]/25 rounded-xl p-2.5 text-left">
            <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center flex-shrink-0">
              <Calendar size={13} />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-mono tracking-wider text-gray-400 uppercase">Sana</p>
              <p className="text-[11px] font-serif text-gray-800 font-bold truncate">13-Avgust, 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#D4AF37]/5 border border-[#D4AF37]/25 rounded-xl p-2.5 text-left">
            <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center flex-shrink-0">
              <Clock size={13} />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-mono tracking-wider text-gray-400 uppercase">Vaqt</p>
              <p className="text-[11px] font-serif text-gray-800 font-bold">18:00</p>
            </div>
          </div>
        </div>

        {/* Hall Info */}
        <div className="flex items-start gap-2 bg-[#D4AF37]/5 border border-[#D4AF37]/25 rounded-xl p-2.5 text-left">
          <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mt-0.5 flex-shrink-0">
            <MapPin size={13} />
          </div>
          <div>
            <p className="text-[8px] font-mono tracking-wider text-gray-400 uppercase">Manzil</p>
            <p className="text-[11px] font-serif text-gray-800 font-bold mb-0.5">&ldquo;Sherdor&rdquo; To&apos;yxonasi</p>
            <p className="text-[9px] font-serif text-gray-600">Yangiyo&apos;l shahar, Toshkent viloyati</p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex flex-col gap-1.5" id="countdown-wrapper">
          <p className="text-[9px] font-display tracking-widest text-[#D4AF37] font-bold uppercase">
            Tantana boshlanishiga qoldi:
          </p>
          
          {timeLeft.isOver ? (
            <div className="py-1.5 text-center text-[11px] text-[#D4AF37] font-serif tracking-wider bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
              Baxtli tantana bugun! 🎉
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1.5 text-center" id="countdown-grid">
              <div className="bg-white border border-[#D4AF37]/20 rounded-lg py-1.5 shadow-sm">
                <span className="block text-[13px] font-bold text-gray-800 font-mono leading-none">{timeLeft.days}</span>
                <span className="text-[7px] tracking-wider text-gray-400 uppercase font-medium mt-0.5 block">Kun</span>
              </div>
              <div className="bg-white border border-[#D4AF37]/20 rounded-lg py-1.5 shadow-sm">
                <span className="block text-[13px] font-bold text-gray-800 font-mono leading-none">{timeLeft.hours}</span>
                <span className="text-[7px] tracking-wider text-gray-400 uppercase font-medium mt-0.5 block">Soat</span>
              </div>
              <div className="bg-white border border-[#D4AF37]/20 rounded-lg py-1.5 shadow-sm">
                <span className="block text-[13px] font-bold text-gray-800 font-mono leading-none">{timeLeft.minutes}</span>
                <span className="text-[7px] tracking-wider text-gray-400 uppercase font-medium mt-0.5 block">Daqiqa</span>
              </div>
              <div className="bg-white border border-[#D4AF37]/20 rounded-lg py-1.5 shadow-sm">
                <span className="block text-[13px] font-bold text-gray-800 font-mono leading-none">{timeLeft.seconds}</span>
                <span className="text-[7px] tracking-wider text-gray-400 uppercase font-medium mt-0.5 block">Soniya</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <span className="font-display text-[8px] tracking-widest text-[#D4AF37]/50 font-semibold">13.08.2026</span>
      </div>
    </div>
  );

  const renderMap = (isMobileView: boolean = false) => (
    <div className={`book-page-side book-page-front paper-page ${isMobileView ? 'rounded-xl h-full' : 'rounded-r-xl h-full'} flex flex-col justify-between ${isMobileView ? 'p-6' : 'p-8'} text-center relative w-full`} id="page-3-front">
      {/* Book depth shadow */}
      {!isMobileView && <div className="absolute inset-y-0 right-0 w-16 inner-shadow-right pointer-events-none opacity-20"></div>}

      {/* Gold frames */}
      <div className="absolute inset-4 border border-[#D4AF37]/15 rounded-lg pointer-events-none"></div>

      <div className="mt-4 flex items-center justify-center gap-1.5">
        <Map size={12} className="text-[#D4AF37]" />
        <span className="font-display text-[9px] tracking-[0.2em] text-[#D4AF37] font-bold uppercase">
          Xarita va Lokatsiya
        </span>
      </div>

      {/* Glassmorphism Map Wrapper */}
      <div className="my-auto mx-1 flex flex-col gap-3">
        <div className={`relative w-full ${isMobileView ? 'h-[160px]' : 'h-[220px]'} rounded-xl overflow-hidden border border-[#D4AF37]/25 shadow-md bg-slate-950`} id="map-iframe-container">
          <iframe 
            id="google-maps-frame"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2998.5!2d69.0770747!3d41.1257616!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae7b3ce8d9151b%3A0x9f69fc522a1ca23e!2sSherdor%20To%27yxonasi!5e0!3m2!1suz!2suz!4v1721130000000!5m2!1suz!2suz" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer"
            className="opacity-85 saturate-50 contrast-125"
            title="Sherdor To'yxonasi Google Maps xaritasi"
          ></iframe>
          {/* Dark gradient gloss overlay */}
          <div className="absolute inset-0 pointer-events-none border border-inset border-[#D4AF37]/10 rounded-xl bg-gradient-to-t from-slate-950/20 to-transparent"></div>
        </div>

        <button 
          id="maps-navigation-btn"
          onClick={(e) => { e.stopPropagation(); openMap(); }}
          className="flex items-center justify-center gap-1.5 mx-auto px-4 py-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 hover:border-[#D4AF37] rounded-full text-[10px] font-bold tracking-widest text-[#D4AF37] transition-all duration-300 hover:scale-[1.03] active:scale-95"
        >
          <Navigation size={10} className="text-[#D4AF37] animate-[pulse_1.5s_infinite]" />
          XARITADA KO&apos;RISH
        </button>
      </div>

      <div className="mb-4">
        <p className="font-serif text-[9px] text-gray-500">Yangiyo&apos;l shahar, Sherdor to&apos;yxonasi</p>
      </div>
    </div>
  );

  const renderRsvp = (isMobileView: boolean = false) => (
    <div className={`book-page-side book-page-back paper-page ${isMobileView ? 'rounded-xl h-full' : 'rounded-l-xl h-full'} flex flex-col justify-between ${isMobileView ? 'p-6' : 'p-8'} text-center relative w-full`} id="page-3-back">
      {/* Book depth shadow */}
      {!isMobileView && <div className="absolute inset-y-0 left-0 w-16 inner-shadow-left pointer-events-none opacity-20"></div>}

      {/* Gold frames */}
      <div className="absolute inset-4 border border-[#D4AF37]/15 rounded-lg pointer-events-none"></div>

      <div className="mt-4 flex flex-col items-center">
        <span className="font-display text-[9px] tracking-[0.2em] text-[#D4AF37] font-bold uppercase">
          Tashrifni Tasdiqlash
        </span>
        <div className="w-8 h-[1px] bg-[#D4AF37]/30 mt-1.5"></div>
      </div>

      <div className="my-auto px-1">
        {rsvpSubmitted ? (
          <div className="flex flex-col items-center justify-center py-5 px-3 bg-[#D4AF37]/5 border border-[#D4AF37]/25 rounded-xl text-center shadow-sm animate-fade-in" id="rsvp-success-card">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center mb-2.5 text-[#D4AF37] animate-[bounce_1s_ease-out_infinite_alternate]">
              <Check size={18} />
            </div>
            <h4 className="font-serif text-[13px] font-bold text-gray-800 mb-1">
              Javobingiz Qabul Qilindi!
            </h4>
            <p className="font-serif text-[10px] leading-relaxed text-gray-600 px-1">
              {isAttending 
                ? `Tashrifingiz uchun minnatdormiz, ${guestName}! Sizni to'yimizda ko'rishdan behad baxtiyormiz. ❤️` 
                : `Rahmat, ${guestName}. Biz uchun bildirilgan e'tiboringiz cheksiz qadrlidir. ✨`
              }
            </p>
          </div>
        ) : (
          <form id="rsvp-form" onSubmit={handleRsvpSubmit} className="flex flex-col gap-3.5 text-left">
            {/* Name input */}
            <div className="flex flex-col gap-1">
              <label htmlFor="guest-name-input" className="text-[9px] font-display tracking-widest text-[#D4AF37] uppercase font-bold">Ismingiz</label>
              <div className="relative">
                <input 
                  id="guest-name-input"
                  type="text" 
                  placeholder="Iltimos, ismingizni kiriting..."
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-transparent text-gray-800 text-[11px] border-b border-[#D4AF37]/40 focus:border-[#D4AF37] rounded-none py-2 pl-8 pr-3 outline-none transition-all duration-300"
                />
                <User size={12} className="absolute left-2.5 top-2.5 text-[#D4AF37]/50" />
              </div>
            </div>

            {/* Attending options */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-display tracking-widest text-[#D4AF37] uppercase font-bold">Tashrif buyurasizmi?</span>
              <div className="grid grid-cols-2 gap-2" id="rsvp-buttons">
                <button
                  id="rsvp-attend-btn"
                  type="button"
                  onClick={() => setIsAttending(true)}
                  className={`py-1.5 px-2 text-[10px] rounded-lg border font-bold text-center transition-all duration-300 ${
                    isAttending === true 
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-gray-950 shadow-sm' 
                      : 'bg-transparent border-gray-300 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Ishtirok etaman
                </button>
                <button
                  id="rsvp-decline-btn"
                  type="button"
                  onClick={() => setIsAttending(false)}
                  className={`py-1.5 px-2 text-[10px] rounded-lg border font-bold text-center transition-all duration-300 ${
                    isAttending === false 
                      ? 'bg-red-50 border-red-300 text-red-700 shadow-sm' 
                      : 'bg-transparent border-gray-300 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Kela olmayman
                </button>
              </div>
            </div>

            {formError && (
              <p id="rsvp-error-msg" className="text-[9px] text-red-500 font-serif leading-none mt-0.5">{formError}</p>
            )}

            <button 
              id="rsvp-submit-btn"
              type="submit"
              className="w-full mt-1.5 py-2 bg-gray-900 hover:bg-black border border-gray-900 text-[#D4AF37] font-display font-bold tracking-widest text-[10px] rounded-lg transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
            >
              YUBORISH
            </button>
          </form>
        )}
      </div>

      <div className="mb-4">
        <span className="font-display text-[8px] tracking-widest text-[#D4AF37]/50 font-semibold">H &amp; M</span>
      </div>
    </div>
  );

  const renderThankYou = (isMobileView: boolean = false) => (
    <div className={`book-page-side book-page-front paper-page ${isMobileView ? 'rounded-xl h-full' : 'rounded-r-xl h-full'} flex flex-col justify-between ${isMobileView ? 'p-6' : 'p-8'} text-center relative w-full`} id="page-4-front">
      {/* Gold frames */}
      <div className="absolute inset-4 border border-[#D4AF37]/15 rounded-lg pointer-events-none"></div>
      
      {/* Corner Ornaments */}
      <div className="ornament-corner ornament-tl" style={{ borderColor: '#D4AF37' }}></div>
      <div className="ornament-corner ornament-tr" style={{ borderColor: '#D4AF37' }}></div>
      <div className="ornament-corner ornament-bl" style={{ borderColor: '#D4AF37' }}></div>
      <div className="ornament-corner ornament-br" style={{ borderColor: '#D4AF37' }}></div>

      <div className="mt-4 flex justify-center">
        <Heart size={18} className="text-[#D4AF37]/60 fill-[#D4AF37]/5" />
      </div>

      <div className="my-auto px-2 flex flex-col gap-4">
        <p className="font-display text-[11px] font-bold text-gold-gradient tracking-[0.2em] uppercase">
          Tashrifingiz uchun rahmat!
        </p>
        
        {/* Styled Ornament Interlocking hearts */}
        <div className="flex items-center justify-center gap-2 my-1">
          <span className="h-[1px] w-6 bg-[#D4AF37]/30"></span>
          <span className="font-display text-[12px] font-bold text-gray-800 tracking-widest">H &amp; M</span>
          <span className="h-[1px] w-6 bg-[#D4AF37]/30"></span>
        </div>

        <p className="font-serif text-[10px] leading-relaxed text-gray-600 italic px-1">
          &ldquo;Baxt baham ko&apos;rilganda go&apos;zalroqdir. Quvonchli kunimizda biz bilan birga bo&apos;lishingiz biz uchun chinakam baxtdir.&rdquo;
        </p>
        
        <p className="font-serif text-[9px] text-gray-500 font-semibold">
          Sizni hurmat bilan kutib qolamiz!
        </p>
      </div>

      <div className="mb-4 flex flex-col items-center">
        {/* Golden seal graphic simulation */}
        <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 flex items-center justify-center bg-gradient-to-br from-[#D4AF37]/10 to-amber-900/10 shadow-sm">
          <Sparkles size={12} className="text-[#D4AF37]" />
        </div>
      </div>
    </div>
  );

  return (
    <main id="main-content" className="invitation-stage relative flex flex-col items-center justify-between min-h-dvh py-3 px-2 sm:py-6 sm:px-4 md:py-10 select-none overflow-hidden font-sans">
      
      {/* Atmospheric wedding stage: candle washes, dust, soft rings */}
      <div className="bg-candle-wash bg-candle-wash--a" aria-hidden="true" />
      <div className="bg-candle-wash bg-candle-wash--b" aria-hidden="true" />
      <div className="bg-candle-wash bg-candle-wash--c" aria-hidden="true" />

      <div
        className="bg-ornament-ring pointer-events-none"
        aria-hidden="true"
        style={{
          top: '50%',
          left: '50%',
          width: 'min(92vw, 720px)',
          height: 'min(92vw, 720px)',
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div
        className="bg-ornament-ring pointer-events-none"
        aria-hidden="true"
        style={{
          top: '50%',
          left: '50%',
          width: 'min(70vw, 520px)',
          height: 'min(70vw, 520px)',
          transform: 'translate(-50%, -50%)',
          animationDelay: '-6s',
          borderColor: 'rgba(212, 175, 55, 0.08)',
        }}
      />

      <div className="bg-dust" aria-hidden="true">
        <span style={{ left: '12%', bottom: '8%', animationDuration: '14s', animationDelay: '0s' }} />
        <span style={{ left: '28%', bottom: '0%', animationDuration: '18s', animationDelay: '3s', width: 2, height: 2 }} />
        <span style={{ left: '48%', bottom: '12%', animationDuration: '16s', animationDelay: '1s' }} />
        <span style={{ left: '67%', bottom: '4%', animationDuration: '20s', animationDelay: '5s', width: 2, height: 2 }} />
        <span style={{ left: '82%', bottom: '16%', animationDuration: '15s', animationDelay: '2s' }} />
        <span style={{ left: '91%', bottom: '6%', animationDuration: '19s', animationDelay: '7s', width: 2, height: 2 }} />
      </div>
      
      {/* Music Control Indicator */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-[#D4AF37]/30 rounded-full py-1.5 pl-3 pr-1.5 shadow-lg shadow-black/50" id="audio-panel">
        <span className="text-[10px] font-mono tracking-widest text-[#D4AF37]/70 font-medium uppercase hidden sm:inline">
          {isPlaying ? "Oh sevaman yor — Ibrohim Nurmatov" : "Musiqa o'chiq"}
        </span>
        <button 
          id="music-toggle-btn"
          onClick={togglePlay}
          className={`relative p-2.5 rounded-full flex items-center justify-center transition-all duration-500 bg-gradient-to-br hover:scale-105 active:scale-95 ${
            isPlaying 
              ? 'from-[#D4AF37] to-amber-600 text-slate-950 shadow-[0_0_15px_rgba(212,175,55,0.4)] animate-[spin_8s_linear_infinite]' 
              : 'from-slate-800 to-slate-900 text-[#D4AF37]/80 border border-[#D4AF37]/20'
          }`}
          title="Musiqa ijrosini boshqarish"
        >
          {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* Top Header / Monogram */}
      <header className="z-10 text-center mb-1 sm:mb-4 transition-all duration-700" id="header-section">
        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#D4AF37]/30 bg-[#0B0F19]/90 shadow-[0_0_10px_rgba(212,175,55,0.05)] mb-1 sm:mb-2" id="monogram-badge">
          <Heart size={16} className="text-[#D4AF37]/80 fill-[#D4AF37]/10 animate-pulse-slow sm:w-[18px] sm:h-[18px]" />
        </div>
        <h2 className="font-display tracking-[0.25em] text-[10px] sm:text-xs font-semibold text-amber-200/80 uppercase">
          Lutfan Taklif Etamiz
        </h2>
      </header>

      {/* BOOK PLAYGROUND SECTION */}
      <section 
        id="book-playground"
        className="relative z-10 flex items-center justify-center flex-1 w-full my-2 sm:my-6 overflow-hidden mx-auto"
        style={{
          width: `${(isMobile ? 425 : 850) * scale}px`,
          height: `${550 * scale}px`,
          maxWidth: '100%',
        }}
      >
        {/* Scaled book sits in a fixed viewport so one mobile page fills the screen */}
        <div 
          className="absolute left-1/2 top-1/2"
          style={{
            width: '850px',
            height: '550px',
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Main Book 3D Container */}
          <div 
            className="book-container relative transition-all duration-700 ease-in-out origin-center animate-fade-in"
            style={{
              width: '850px',
              height: '550px',
              transform: bookTranslateX,
            }}
            onClick={startMusicOnInteraction}
          >
            {/* Main Book Under-Shadow sitting behind the real book */}
            <div className="absolute -inset-1 rounded-2xl bg-black/50 blur-xl translate-y-4 transition-all duration-700" id="book-drop-shadow"></div>

            {/* Underlay Left cover spine back shadow for added realism */}
            <div className={`absolute left-0 top-0 w-1/2 h-full bg-[#0B0F19] rounded-l-2xl border-l-2 border-y-2 border-amber-900/30 transition-all duration-700 ${currentSpread > 0 ? 'opacity-100 shadow-[inset_-10px_0_30px_rgba(0,0,0,0.8)]' : 'opacity-0'}`} id="left-cover-underlay">
              {/* Texture */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:24px_24px] rounded-l-2xl"></div>
            </div>

            {/* The 3D Book Wrapper which pans on mobile */}
            <div 
              className="book-wrapper" 
              id="book-spine-wrapper"
              style={{
                transform: 'none',
              }}
            >
              
              {/* Spine Center Joint Ring Cover (only visible when book is open) */}
              <div className={`absolute left-1/2 top-0 w-[4px] h-full bg-gradient-to-r from-amber-600/30 via-slate-950 to-amber-600/30 z-40 -translate-x-1/2 pointer-events-none transition-opacity duration-700 ${currentSpread > 0 ? 'opacity-100' : 'opacity-0'}`} id="book-center-spine">
                <div className="absolute inset-0 center-spine-shadow"></div>
              </div>

              {/* ==================== LEAF 1 (Cover / Intro Quote) ==================== */}
              <div 
                className="book-leaf" 
                id="leaf-1"
                style={{
                  transform: `rotateY(${currentSpread >= 1 ? -180 : 0}deg)`,
                  zIndex: currentSpread >= 1 ? 1 : 9,
                  transitionDelay: currentSpread >= 1 ? '0s' : '0.1s'
                }}
              >
                {renderCover(isMobile)}
                {renderQuote(isMobile)}
              </div>

              {/* ==================== LEAF 2 (Invitation Text / Event Details) ==================== */}
              <div 
                className="book-leaf" 
                id="leaf-2"
                style={{
                  transform: `rotateY(${currentSpread >= 2 ? -180 : 0}deg)`,
                  zIndex: currentSpread >= 2 ? 2 : 8,
                  transitionDelay: currentSpread >= 2 ? '0.05s' : '0.05s'
                }}
              >
                {renderInvitation(isMobile)}
                {renderDetails(isMobile)}
              </div>

              {/* ==================== LEAF 3 (Map / RSVP) ==================== */}
              <div 
                className="book-leaf" 
                id="leaf-3"
                style={{
                  transform: `rotateY(${currentSpread >= 3 ? -180 : 0}deg)`,
                  zIndex: currentSpread >= 3 ? 3 : 7,
                  transitionDelay: currentSpread >= 3 ? '0.1s' : '0s'
                }}
              >
                {renderMap(isMobile)}
                {renderRsvp(isMobile)}
              </div>

              {/* ==================== LEAF 4 (Aesthetic Back Cover - Static Page to the Right of RSVP) ==================== */}
              <div 
                className="book-leaf pointer-events-none" 
                id="leaf-4"
                style={{
                  transform: 'rotateY(0deg)',
                  zIndex: 6
                }}
              >
                {renderThankYou(isMobile)}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Navigation and spread indicators below the book */}
      <footer className="z-10 flex flex-col items-center gap-2 sm:gap-4 w-full max-w-md mt-1" id="footer-section">
        {/* Progress Bar / Dots */}
        <div className="flex items-center gap-3 sm:gap-4 py-1 sm:py-2 w-full justify-center" id="progress-container">
          <button 
            id="prev-page-arrow"
            onClick={prevPage}
            disabled={isMobile ? activePage === 0 : currentSpread === 0}
            className={`p-2.5 sm:p-2 rounded-full border transition-all duration-300 ${
              (isMobile ? activePage === 0 : currentSpread === 0)
                ? 'border-[#D4AF37]/5 text-[#D4AF37]/10 cursor-not-allowed' 
                : 'border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/60 active:scale-90 shadow-md'
            }`}
            aria-label="Oldingi sahifa"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Spread indicator dots */}
          <div className="flex items-center gap-2 max-w-[200px] overflow-x-auto no-scrollbar py-1" id="progress-dots">
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                id={`progress-dot-desktop-${idx}`}
                onClick={() => {
                  startMusicOnInteraction();
                  setActivePage(idx === 0 ? 0 : idx * 2 - 1);
                }}
                className={`h-2 rounded-full transition-all duration-500 ${
                  currentSpread === idx 
                    ? 'w-6 bg-gradient-to-r from-[#D4AF37] to-amber-600 shadow-[0_0_8px_rgba(212,175,55,0.4)]' 
                    : 'w-2 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/40'
                }`}
                title={`Sahifa ${idx + 1}`}
              />
            ))}
          </div>

          <button 
            id="next-page-arrow"
            onClick={nextPage}
            disabled={isMobile ? activePage === maxPage : currentSpread === totalSpreads}
            className={`p-2.5 sm:p-2 rounded-full border transition-all duration-300 ${
              (isMobile ? activePage === maxPage : currentSpread === totalSpreads)
                ? 'border-[#D4AF37]/5 text-[#D4AF37]/10 cursor-not-allowed' 
                : 'border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/60 active:scale-90 shadow-md'
            }`}
            aria-label="Keyingi sahifa"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Closing Footnote / Technical Detail */}
        <div className="text-center mt-2" id="footnote">
          <p className="text-[10px] font-mono tracking-[0.15em] text-[#D4AF37]/50 font-semibold">
            H &amp; M &bull; 13.08.2026
          </p>
        </div>
      </footer>
    </main>
  );
}
