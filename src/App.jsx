import React, { useState, useEffect, useRef, useMemo } from 'react';
import baMotMinh from './ba_mot_minh.jpg';
import baVoiCun from './ba_voi_cun.jpg';
import selfie2BaChau from './selfie_2_ba_chau.jpg';
import GrandmaChat from './GrandmaChat';
import GlassIceSound from './Glass-ice-sound.m4a';

const styleInject = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Special+Elite&display=swap');
  
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: #0c0e0c;
    color: #e5e5e0;
    overflow-x: hidden;
  }
  
  .font-serif {
    font-family: 'Playfair Display', serif;
  }

  .font-typewriter {
    font-family: 'Special Elite', monospace;
  }
  
  /* Smooth section transition shadows */
  .section-shadow-top {
    box-shadow: inset 0 20px 20px -20px rgba(0,0,0,0.8);
  }

  /* Archival custom styling */
  .letter-paper {
    background-color: #f7f5f0;
    color: #2b2b29;
    border-radius: 4px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 
                0 8px 10px -6px rgba(0, 0, 0, 0.4),
                inset 0 0 40px rgba(139, 115, 85, 0.15);
    background-image: linear-gradient(#e1dcd3 1px, transparent 1px);
    background-size: 100% 2rem;
  }

  /* Custom scrollbar for archival transcripts */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #0c0e0c;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #2a2e2a;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #ca8a04;
  }
`;

if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = styleInject;
  document.head.appendChild(styleTag);
}

class ArchivalAudioEngine {
  constructor() {
    this.ctx = null;
    this.activeNodes = [];
    this.hanoiAmbientGain = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.mainGain = this.ctx.createGain();
    this.mainGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    this.mainGain.connect(this.ctx.destination);
  }

  // Play Hanoi street context sound layers
  playHanoiAmbient(type) {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    if (type === 'motorbikes') {
      const audioTrack = new Audio(GlassIceSound);
      audioTrack.loop = true;
      const source = this.ctx.createMediaElementSource(audioTrack);
      source.connect(this.mainGain);
      audioTrack.play();

      audioTrack.stop = () => {
        audioTrack.pause();
        audioTrack.currentTime = 0;
      };
      
      this.activeNodes.push(audioTrack);
    } else {
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      
      const bellOsc = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(880, this.ctx.currentTime);
      bellGain.gain.setValueAtTime(0.005, this.ctx.currentTime);
      bellOsc.connect(bellGain);
      bellGain.connect(this.mainGain);
      bellOsc.start();
      bellOsc.stop(this.ctx.currentTime + 3);
      this.activeNodes.push(bellOsc);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

      noiseNode.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.mainGain);
      noiseNode.start();
      this.activeNodes.push(noiseNode);
    }
  }

  // Synthesize short unique object resonance triggers
  playObjectTone(objectId) {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    if (objectId === 'snack') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      oscGain.gain.setValueAtTime(0.12, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    } else if (objectId === 'stool') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
      oscGain.gain.setValueAtTime(0.2, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    } else if (objectId === 'cup') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      oscGain.gain.setValueAtTime(0.15, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    } else if (objectId === 'coffee' || objectId === 'coconut') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      oscGain.gain.setValueAtTime(0.1, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    } else if (objectId === 'yogurt') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.linearRampToValueAtTime(650, now + 0.2);
      oscGain.gain.setValueAtTime(0.08, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    }

    osc.connect(oscGain);
    oscGain.connect(this.mainGain);
    osc.start();
    osc.stop(now + 1);
    this.activeNodes.push(osc);
  }

  stopAll() {
    this.activeNodes.forEach(node => {
      try { node.stop(); } catch(e){}
    });
    this.activeNodes = [];
  }
}

const soundEngine = new ArchivalAudioEngine();

const AUTHENTIC_TRANSCRIPT = [
  {
    id: "seg-1",
    timestamp: "01:15",
    topic: "Origins & State Assignment",
    speaker: "Bà Ngoại",
    vietnamese: "Quê của bà ở xã Quảng Văn, huyện Quảng Xương, tỉnh Thanh Hóa. Năm nay bà đã 85 tuổi rồi. Thời trẻ, học xong cấp 2 thì bà đi học ở trường Y sĩ Nam Hà trong 2 năm. Tốt nghiệp xong, bà được phân công về Bộ Y tế và làm việc ở đó được 10 năm tất cả. Từ khi về văn phòng Bộ, bà được phân một căn nhà ở phố số 5 Quang Trung. Sau đó, bà được cử đi học chuyên trách công tác Đảng rồi thành phố điều động bà về Ban Tuyên giáo Quận ủy Hoàn Kiếm làm việc suốt 10 năm trời.",
    english: "My hometown is in Quang Van, Quang Xuong, Thanh Hoa. I am 85 years old this year. In my youth, after secondary school, I trained at the Nam Ha Physician School for two years. Upon graduation, I was assigned to the Ministry of Health, where I worked for ten years. Since joining the Ministry's office, I was allocated a room at No. 5 Quang Trung. Later, after being trained in Party affairs, the city transferred me to the Propaganda Department of the Hoan Kiem District Party Committee, where I worked for another ten years."
  },
  {
    id: "seg-2",
    timestamp: "04:50",
    topic: "Meeting Pham Chi Lan",
    speaker: "Bà Ngoại",
    vietnamese: "Thời điểm đó, bà Phạm Chi Lan đang làm việc tại khối thương nghiệp của thành phố. Vì bà theo dõi khối thương nghiệp của quận nên bà thường xuyên gặp gỡ và làm việc với bà Chi Lan. Hai chị em thân thiết, hay tâm sự với nhau. Bà Chi Lan nghe xong hoàn cảnh mới bảo bà: 'Phi thương bất phú em ạ! Nếu em không chịu khó làm ăn, cứ trông chờ vào đồng lương công chức mãi thế này thì không có kinh tế để lo cho các con khôn lớn đâu. Bây giờ một là em tranh thủ làm thêm, hai là em xin về hưu sớm rồi mở cửa hàng buôn bán.'",
    english: "At that time, Ms. Pham Chi Lan was working in the city's commercial sector. Since I supervised Hoan Kiem's commerce, I regularly met and worked with Ms. Chi Lan. We became close confidantes. Hearing about my family's struggles, she told me: 'There is no wealth without trade! If you just depend on a civil servant's salary without doing business, you will never have enough resources to raise your children. You should either work a side business or retire early to open a shop.'"
  },
  {
    id: "seg-3",
    timestamp: "08:15",
    topic: "The Early Retirement Sacrifice",
    speaker: "Bà Ngoại",
    vietnamese: "Đất nước bắt đầu thời kỳ mở cửa, bà nhìn con cái người ta được ăn phở buổi sáng, còn hai đứa con mình sáng sáng vẫn phải ăn mì tôm gói hoặc ăn cơm nguội lầm lũi đi học. Bà quyết định xin về hưu sớm năm 49 tuổi để buôn bán lo cho các con học hành đàng hoàn. Ai cũng can ngăn vì nếu ở lại thêm 2-3 năm bà sẽ được nâng bậc lương và hưởng tiêu chuẩn khám bệnh ở Bệnh viện Hữu nghị Việt Xô. Nhưng bà bảo mọi người: 'Tôi không cần tiêu chuẩn gì cả. Trong tâm trí tôi bây giờ chỉ nghĩ đến hai đứa con. Tôi về làm lụng để nuôi các con ăn học thành người.'",
    english: "As the country opened up, I saw other children eating noodle soup in the morning, while my two kids had to eat instant noodles or leftover cold rice before walking to school. I decided to retire early at 49 to start a business and fund their education. Everyone tried to stop me because staying 2-3 more years meant a salary raise and health privileges at the elite Viet Xo Friendship Hospital. But I replied: 'I don't need any special privileges. My mind is occupied only with my two children. I am going back to daily labor to raise them right.'"
  },
  {
    id: "seg-4",
    timestamp: "12:30",
    topic: "Breaking the Wall & Shop Setup",
    speaker: "Bà Ngoại",
    vietnamese: "Nhà mình ở phố Quang Trung nhưng lối vào lại nằm ở trong ngõ. Thấy các anh chị lớn tuổi trong dãy tập thể khi về hưu chủ động phá tường ngăn để mở cửa hàng trước rồi, bà cũng bắt chước phá một bức tường để mở cửa hàng hướng thẳng ra mặt phố. Khi bà phá bức tường đó ra thì diện tích cửa hàng rất rộng rãi, đối diện ngay cổng trường THPT Việt Đức trên phố Lý Thường Kiệt. Khách đông nhất là các cháu học sinh Việt Đức. Bà bán xởi lởi, đứa nào thèm ăn uống mà chưa có tiền liền xin ăn chịu, bà cũng vui vẻ cho các cháu nợ hết.",
    english: "Our collective flat was on Quang Trung Street, but the entrance was hidden inside an alley. Seeing retired neighbors break their courtyard walls to set up shops, I followed suit and demolished a section of our wall to open directly onto the street corner. It gave us a spacious storefront directly facing the gate of Viet Duc High School on Ly Thuong Kiet. My main customers were those students. I sold things generously; if any kid wanted a snack but had no money, I gladly let them buy on credit."
  },
  {
    id: "seg-5",
    timestamp: "17:45",
    topic: "32 Taels of Gold & Real Wealth",
    speaker: "Bà Ngoại",
    vietnamese: "Thực tế đã chứng minh quyết định của bà hoàn toàn đúng đắn. Trong 5 năm tự mở cửa hàng kinh doanh, bà đã tích lũy và tiết kiệm được tới 32 cây vàng! Với số vàng đó, bà mua được một ngôi nhà khác, rồi lại đem cho thuê chính ngôi nhà ấy để sinh dòng tiền dưỡng già và chữa bệnh tiểu đường cho ông ngoại. Nếu ngày đó bà tham lam quyền lợi, cố bám trụ lại cơ quan nhà nước lấy cái tiêu chuẩn Việt Xô thì có lẽ cả gia đình đã phải sống rất chật vật, vất vả, con người ta được sung sướng còn con mình thì chịu khổ.",
    english: "Reality proved my decision was absolutely right. In just five years of running the shop, I saved up to 32 taels of gold! With that gold, I bought another house and rented out the old one to secure a steady cash flow for retirement and care for your grandfather's diabetes. If I had clung to state employment for the Viet Xo hospital standard, my family would have struggled terribly—others' kids would have prospered while mine suffered."
  }
];

const Universal3DViewer = ({ title, meshId, splatUrl }) => {
  const [activeFormat, setActiveFormat] = useState('mesh');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
  }, [activeFormat]);

  const hasMesh = !!meshId;
  const hasSplat = !!splatUrl;

  const getEmbedUrl = () => {
    if (activeFormat === 'mesh' && hasMesh) {
      return `https://sketchfab.com/models/${meshId}/embed?autostart=1&camera=0&preload=1&ui_controls=1&ui_infos=0&ui_watermark=0`;
    }
    return splatUrl;
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
      <div className="p-3 bg-neutral-950/90 border-b border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h4 className="font-serif text-sm text-neutral-200 tracking-wide font-semibold">{title}</h4>
          <p className="text-[10px] text-amber-500 font-mono tracking-wider uppercase mt-0.5">
            {activeFormat === 'mesh' ? 'High Fidelity Polygon Mesh' : '3D Gaussian Splatting Field'}
          </p>
        </div>

        {hasMesh && hasSplat && (
          <div className="flex bg-neutral-900/80 p-0.5 rounded-lg border border-neutral-800 self-stretch sm:self-auto">
            <button
              onClick={() => setActiveFormat('mesh')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded text-[10px] font-mono tracking-wider transition-all duration-300 ${
                activeFormat === 'mesh'
                  ? 'bg-amber-600 text-black font-semibold shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Mesh
            </button>
            <button
              onClick={() => setActiveFormat('splat')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded text-[10px] font-mono tracking-wider transition-all duration-300 ${
                activeFormat === 'splat'
                  ? 'bg-amber-600 text-black font-semibold shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Splat
            </button>
          </div>
        )}
      </div>

      <div className="relative w-full h-[280px] md:h-[320px] bg-neutral-950">
        {loading && (
          <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center space-y-3 z-10">
            <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              Initializing Spatial Grid...
            </p>
          </div>
        )}
        <iframe
          title={title}
          src={getEmbedUrl()}
          className="w-full h-full border-0 block"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
};

export default function App() {
  const [activeAmbient, setActiveAmbient] = useState(null);
  const [activeObjectSound, setActiveObjectSound] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const progressTimer = useRef(null);

  // States for the integrated Side Panel control
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEnglish, setIsEnglish] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSegment, setActiveSegment] = useState(null);

  // --- Synchronized Oral History Audio Playback Engine States ---
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const currentAudioRef = useRef(null);

  // Core internal function to force-start an audio segment track
  const forcePlaySegmentAudio = (segId) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }

    const trackUrl = `/audio/${segId}.m4a`;
    const audio = new Audio(trackUrl);
    currentAudioRef.current = audio;
    
    setPlayingAudioId(segId);
    audio.play().catch((err) => {
      console.warn(`Audio track stream blocked or missing at: ${trackUrl}`);
      setPlayingAudioId(null);
    });

    audio.onended = () => {
      setPlayingAudioId(null);
    };
  };

  // Handles manual side-panel bubble clicks (toggles play/pause)
  const toggleSegmentAudio = (segId) => {
    if (playingAudioId === segId) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      setPlayingAudioId(null);
    } else {
      forcePlaySegmentAudio(segId);
    }
  };

  // UPGRADED NAVIGATION FUNCTION: Opens panel, scrolls to text, AND autoplays!
  const navigateToSegment = (segId) => {
    setIsPanelOpen(true);
    setActiveSegment(segId);
    
    // Trigger the automated voice tape playback engine instantly on click
    forcePlaySegmentAudio(segId);

    // Smooth scroll execution tracking
    setTimeout(() => {
      const element = document.getElementById(segId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  useEffect(() => {
    return () => {
      soundEngine.stopAll();
      if (currentAudioRef.current) currentAudioRef.current.pause();
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, []);

  const toggleAmbientSound = (type) => {
    soundEngine.stopAll();
    if (activeAmbient === type) {
      setActiveAmbient(null);
    } else {
      setActiveAmbient(type);
      soundEngine.playHanoiAmbient(type);
    }
  };

  const triggerObjectSound = (id) => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    soundEngine.playObjectTone(id);
    setActiveObjectSound(id);
    setAudioProgress(0);

    let count = 0;
    progressTimer.current = setInterval(() => {
      count += 1;
      setAudioProgress((count / 10) * 100);
      if (count >= 10) {
        clearInterval(progressTimer.current);
        setActiveObjectSound(null);
        setAudioProgress(0);
      }
    }, 100);
  };

  const filteredSegments = useMemo(() => {
    return AUTHENTIC_TRANSCRIPT.filter(seg => {
      const query = searchQuery.toLowerCase();
      return (
        seg.vietnamese.toLowerCase().includes(query) ||
        seg.english.toLowerCase().includes(query) ||
        seg.topic.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#0d0f0d] text-[#e8e6df] font-sans selection:bg-amber-800 selection:text-amber-100 pb-24 flex relative overflow-hidden">
      
      {/* MAIN VIEWPORT LAYOUT */}
      <div className={`flex-1 transition-all duration-300 overflow-y-auto max-h-screen ${isPanelOpen ? 'mr-0 lg:mr-[480px] xl:mr-[540px]' : 'mr-0'}`}>
        
        {/* CONCEPT HEADER */}
        <div className="border-b border-neutral-800 py-3 px-4 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center text-xs text-neutral-500 font-mono tracking-tight gap-2 bg-neutral-950/40">
          <div>HANOI DIGITAL HUMANITIES ARCHIVE</div>
          <div className="flex items-center space-x-4">
            <span className="text-amber-500 font-semibold tracking-wider">Concept: Hanoi in 30 square meters</span>
            <span className="text-emerald-500 animate-pulse">● EXPERIMENTAL EXHIBIT LIVE</span>
          </div>
        </div>

        {/* SECTION 1: INTRODUCTION */}
        <section className="relative bg-[#070907] py-24 px-4 md:px-8 border-b border-neutral-900 overflow-hidden min-h-screen flex items-center">
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="absolute top-1/4 left-[-100px] w-[350px] h-0.5 bg-amber-400 blur-md animate-pulse transform rotate-12" style={{ animationDuration: '6s' }}></div>
            <div className="absolute top-1/2 right-[-100px] w-[500px] h-0.5 bg-yellow-300 blur-sm transform -rotate-6 animate-pulse" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-1/3 left-1/4 w-[250px] h-px bg-neutral-600 blur-none"></div>
            <div className="absolute w-1.5 h-1.5 bg-amber-500 rounded-full left-0 top-1/3 animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute w-1.5 h-1.5 bg-neutral-400 rounded-full right-10 top-2/3 animate-ping" style={{ animationDuration: '5.2s' }}></div>
          </div>

          <div className="max-w-4xl mx-auto space-y-12 relative z-10">
            <span className="text-amber-500 uppercase tracking-widest text-xs font-mono block">
              Sidewalk Heritage Research Collective
            </span>
            
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-100 leading-[1.1]">
              The Soul of Hanoi's Sidewalk: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 italic">
                Grandma's Tea Stall
              </span>
            </h1>

            <div className="prose prose-invert text-neutral-300 text-base md:text-xl font-light leading-relaxed space-y-6 max-w-3xl">
              <p>
                Hanoi is known for its distinctive ways of life, and one of the most 
                iconic is sidewalk iced tea culture: a place where simple yet unforgettable 
                images live in the memories of Vietnamese people: motorbikes, plastic stools, 
                glasses of tea, street-side stalls,.. These places are neither beautiful nor perfect, 
                yet they hold memories for generations of Hanoians, especially students, as tea stalls 
                seem to spring up outside school gates.
              </p>
              <p>
                At No. 42, Ly Thuong Kiet Street, a well-known sidewalk tea stall stands in front of Viet 
                Duc High School. A location like this might be expected to house a luxury restaurant, but 
                instead, it is home to an irreplaceable tea stall, one that carries meanings far beyond 
                what it appears to be. Join us in discovering the story of Bao Phuong's Grandma and her tea stall.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-stretch gap-6 pt-4 w-full">
              <div className="flex flex-col items-center justify-between p-2 bg-neutral-950/60 rounded-xl border border-neutral-900 group w-full md:w-[360px]">
                <div className="w-full h-[350px] overflow-hidden rounded-lg bg-neutral-900 border border-neutral-800">
                  <img
                    src={baMotMinh}
                    alt="Bà Ngoại Portrait"
                    className="w-full h-full object-cover transform transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl filter brightness-95 group-hover:brightness-100"
                  />
                </div>
                <div className="w-full text-center pt-3 pb-1 px-2">
                  <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
                    This is Bà Ngoại
                  </span>
                  <p className="text-xs font-sans text-neutral-400 leading-relaxed">
                    Phuong calls her Ba Ngoai ("Grandma"). The stories we will explore in this exhibit are all based on her real-life experiences and memories.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-between p-2 bg-neutral-950/60 border border-neutral-900 rounded-xl w-full md:w-[360px]">
                <div className="w-full h-[350px] rounded-lg overflow-hidden border border-neutral-800 relative">
                  <iframe
                    className="w-full h-full absolute inset-0"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src="https://maps.google.com/maps?width=430&height=400&hl=en&q=42%20l%C3%BD%20th%C6%B0%E1%BB%9Dng%20ki%E1%BB%87t&t=h&z=15&ie=UTF8&iwloc=B&output=embed"
                    title="Map: 42 Ly Thuong Kiet"
                  />
                </div>
                <div className="w-full text-center pt-3 pb-1 px-2">
                  <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
                    Where the Tea Stall Lives
                  </span>
                  <p className="text-xs font-sans text-neutral-400 leading-relaxed">
                    Located at No. 42 Ly Thuong Kiet, right across from Viet Duc High School. Open Google Maps to explore the surroundings.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-wrap gap-4 items-center">
              <button 
                onClick={() => navigateToSegment('seg-1')}
                className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-black font-semibold rounded-lg shadow-lg font-mono text-sm tracking-wider uppercase transition-all duration-300 flex items-center space-x-2"
              >
                <span>Get to Know Grandma through Oral History!</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: “TRÀ ĐÁ” IN HOAN KIEM */}
        <section className="bg-[#181d19] py-24 px-4 md:px-8 border-b border-neutral-900 section-shadow-top">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center space-x-2 text-xs font-mono text-amber-500/90">
                <span>02 / DAILY CONVERSATIONS</span>
                <span className="w-12 h-px bg-amber-500/30"></span>
              </div>
              
              <h2 className="font-serif text-3xl md:text-5xl text-neutral-100 font-semibold tracking-tight">
                “Trà đá” in Hoan Kiem
              </h2>
              
              <div className="prose prose-invert text-neutral-300 text-sm md:text-base font-light leading-relaxed space-y-4">
                <p>
                  In the afternoon, the area outside Viet Duc High School used to get crowded very quickly.
                </p>
                <p>
                  Students poured out through the school gate, still wearing white uniforms, some carrying helmets in one hand and worksheets in the other. Motorbikes blocked half the street. Teachers stopped nearby to buy drinks before going home. People from the neighborhood passed by constantly.
                </p>
                <p>
                  The shop was narrow. A few plastic stools. Snacks hanging from metal hooks. Ice in a blue cooler. Tea was poured into glass cups that were used over and over again throughout the day, just the same as every other tea stall in Hanoi.
                </p>
                <p className="border-l-2 border-amber-500/60 pl-4 py-1.5 italic text-neutral-400">
                  Most people did not come because the tea or food was special; they were indeed not the best in town. They came because they already knew the place and the warmth of the lady behind the stall.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleAmbientSound('motorbikes')}
                  className={`px-4 py-3 rounded-lg border text-xs font-mono tracking-wider transition-all duration-300 ${
                    activeAmbient === 'motorbikes'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-amber-500/10 border-neutral-800 text-neutral-400 hover:text-neutral-100'
                  }`}
                >
                  {activeAmbient === 'motorbikes' ? ' Click to Stop The Playing of The Stall Ambiance' : ' CLICK TO PLAY 📣: THE TEA STALL AMBIANCE'}
                </button>              
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="w-full h-[350px] bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl relative">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!4v1780235993646!6m8!1m7!1sxZY7WdVJewHNepyVlSPatA!2m2!1d21.02358639555791!2d105.8497316405359!3f16.302769845067708!4f-9.656542782210664!5f1.9587109090973311" 
                  className="w-full h-full border-0 absolute inset-0"
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hanoi Sidewalk Streetscape Map"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: CONVERSATION PROTOCOLS & SCANNED OBJECTS */}
        <section className="bg-[#1d1814] py-24 px-4 md:px-8 border-b border-neutral-900 text-[#eae7e0]">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center space-x-2 text-xs font-mono text-amber-500/90">
                  <span>03 / THE MECHANICS OF RUNNING A STALL</span>
                  <span className="w-12 h-px bg-amber-500/30"></span>
                </div>
                
                <h2 className="font-serif text-3xl md:text-5xl text-neutral-100 font-semibold tracking-tight leading-tight">
                  Sourcing Wisdom & Business Secrets
                </h2>

                <div className="text-neutral-300 font-light text-base md:text-lg leading-relaxed space-y-4">
                  <p>
                    It was the early Doi Moi period, and the country was just starting to open up. Yet the mindset of many people, including Grandma, was still very much rooted in the old system. She had been a civil servant for years, and the idea of doing business was completely foreign to her.
                  </p>
                  <p>
                    At first, she did not know much about running a business. She was a nurse in the Ministry of Health and later become an officer at her District Party Committee. Her jobs mean she was completely unfamiliar with open trade.
                  </p>
                  <p>
                    But through meetings with <b>Phạm Chi Lan</b> from the city's commercial sector, she discovered trade mechanisms. Local vendors showed her little things one by one: which snacks sold fastest, where to buy tea leaves at morning markets, and how to balance sweet rates for schoolkids.
                  </p>
                  <p className="font-serif italic text-amber-400 cursor-pointer hover:underline" onClick={() => navigateToSegment('seg-2')}>
                    "Phi thương bất phú em ạ!" (There is no wealth without trade!) — Click on to learn more about the meeting with economic specialist Phạm Chi Lan inside the oral records.
                  </p>
                </div>
              </div>

              {/* Right Side: Archival Portrait Frame with Custom Interactive Wiki Overlay */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <a
                  href="https://vi.wikipedia.org/wiki/Ph%E1%BA%A1m_Chi_Lan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-neutral-950/60 rounded-xl border border-neutral-900 group w-full max-w-[360px] block cursor-pointer transition-all duration-300 hover:border-amber-500/40 relative"
                >
                  
                  {/* Image Frame Wrapper Container */}
                  <div className="w-full h-[320px] overflow-hidden rounded-lg bg-neutral-900 border border-neutral-800 relative">
                    <img
                      src="https://doanhnhanplus.vn/wp-content/uploads/2018/01/pham-chi-lan-1.jpg"
                      alt="Economist Phạm Chi Lan"
                      className="w-full h-full object-cover transform transition-all duration-500 ease-out group-hover:scale-105 filter brightness-90 contrast-105 select-none"
                      loading="lazy"
                    />

                    {/* Smooth Fade-in Custom Hover Tooltip Overlay */}
                    <div className="absolute inset-0 bg-neutral-950/85 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all duration-300 flex flex-col items-center justify-center p-6 text-center">
                      <p className="font-mono text-xs text-amber-400 tracking-wide leading-relaxed">
                        You don't know who she is?
                      </p>
                      <span className="font-serif italic text-sm text-neutral-100 mt-2 block underline decoration-amber-500/40 underline-offset-4">
                        Click to see her Wikipedia page!
                      </span>
                    </div>
                  </div>
                  
                  {/* Image Caption Metadata */}
                  <div className="w-full text-center pt-3 pb-1 px-2">
                    <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
                      Chuyên gia kinh tế Phạm Chi Lan
                    </span>
                    <p className="text-xs font-sans text-neutral-400 leading-relaxed font-light">
                      An influential economic specialist whose advice on trade mechanisms served as the foundational catalyst for early sidewalk business choices.
                    </p>
                  </div>

                </a>
              </div>

              <div className="lg:col-span-12 w-full max-w-6xl mx-auto mt-8">
                <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-850 space-y-4">
                  <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block">Appealing, but....</span>
                  <p className="text-neutral-300 text-sm md:text-base font-light leading-relaxed">
                    Not everyone was supportive of the tea stall. Some thought it was risky to leave a stable government job with many perks of staying just a few years more.
                  </p>
                  <div className="pt-2">
                    <button 
                      onClick={() => navigateToSegment('seg-3')}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-semibold rounded font-mono text-xs transition-all flex items-center space-x-2"
                    >
                      <span> Click to listen to the interview segment to hear her ambition to fund her kids' education.</span>
                    </button>
                  </div>
                </div>    
              </div>            
            </div>

            {/* THE OBJECTS GRID */}
            <div className="space-y-8">
              <div className="border-t border-neutral-800 pt-8">
                <h3 className="font-serif text-2xl text-neutral-100 mb-6">Interactive Object Repository</h3>
                <p className="text-xs text-neutral-400 font-mono mb-8">
                  * Drag inside the viewport to rotate objects. Use the toggle buttons to swap between detailed polygonal Mesh arrays and Gaussian Splatting fields.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* OBJECT 1: SNACK */}
                <div className="bg-neutral-950/40 p-6 rounded-2xl border border-neutral-900 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-amber-500 tracking-widest uppercase">Object No. 01</span>
                    <h4 className="font-serif text-xl text-neutral-200">Snack (bim bim)</h4>
                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                      Someone taught her which snacks students loved most. High schoolers consistently requested light, salted snacks to keep their energy levels high while socializing on the sidewalk.
                    </p>
                  </div>

                  <Universal3DViewer 
                    title="Snack (Bim Bim) Scan"
                    meshId="56729dfda4784e12ace1d437005fa47c" 
                    splatUrl="https://superspl.at/s?id=52810bec" 
                  />

                  
                </div>

                {/* OBJECT 2: PLASTIC STOOL */}
                <div className="bg-neutral-950/40 p-6 rounded-2xl border border-neutral-900 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-amber-500 tracking-widest uppercase">Object No. 02</span>
                    <h4 className="font-serif text-xl text-neutral-200">Plastic stool</h4>
                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                      Easily movable chair to sit on. Grandma only arranged them when customers came. They define the flexible threshold of Hanoi's sidewalk space.
                    </p>
                  </div>

                  <Universal3DViewer 
                    title="Plastic Stool Scan"
                    meshId="e5362bb491184403abc0cb2e9b7bf2ea" 
                    splatUrl="https://superspl.at/s?id=5d39a9b8" 
                  />

                  
                </div>

                {/* OBJECT 3: TEA/JUICE CUP */}
                <div className="bg-neutral-950/40 p-6 rounded-2xl border border-neutral-900 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-amber-500 tracking-widest uppercase">Object No. 03</span>
                    <h4 className="font-serif text-xl text-neutral-200">Tea/juice cup</h4>
                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                      This was how she learned the perfect tea ratio. Brewed raw tea leaves poured over thick block ice to stay frosty even during blistering summer school afternoons.
                    </p>
                  </div>

                  <Universal3DViewer 
                    title="Tea Cup Scan"
                    meshId="af754ecc6779424fb8eee25053dc36f6" 
                    splatUrl="https://superspl.at/s?id=1405e51f" 
                  />

                  
                </div>

                {/* OBJECT 4: TRADITIONAL COFFEE PHIN FILTER */}
                <div className="bg-neutral-950/40 p-6 rounded-2xl border border-neutral-900 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-amber-500 tracking-widest uppercase">Object No. 04</span>
                    <h4 className="font-serif text-xl text-neutral-200">Coffee filter (Phin cà phê)</h4>
                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                      This is still how traditional black coffee is brewed on the streets. Slow dripping metal filters constructed a quiet pocket of patience over concentrated dark grounds.
                    </p>
                  </div>

                  <Universal3DViewer 
                    title="Traditional Phin Filter Scan"
                    meshId="edc31e052f974766b3107ff7042e1834" 
                    splatUrl="https://superspl.at/s?id=4ab364ce" 
                  />

              
                </div>

                {/* OBJECT 5: YOGURT BOTTLE */}
                <div className="bg-neutral-950/40 p-6 rounded-2xl border border-neutral-900 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-amber-500 tracking-widest uppercase">Object No. 05</span>
                    <h4 className="font-serif text-xl text-neutral-200">Yogurt (Sữa chua)</h4>
                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                      Apart from traditional teas, Grandma’s stall kept custom frozen options for hot days. Sweet fluid packets that neighborhood high school crowds loved buying between class blocks.
                    </p>
                  </div>

                  <Universal3DViewer 
                    title="Yogurt Drinking Bottle Scan"
                    meshId="a5efe2139e5d4b44a7d468601c49b37c" 
                    splatUrl="https://superspl.at/s?id=f494af3f" 
                  />

                  
                </div>

                {/* OBJECT 6: FRESH COCONUT */}
                <div className="bg-neutral-950/40 p-6 rounded-2xl border border-neutral-900 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-amber-500 tracking-widest uppercase">Object No. 06</span>
                    <h4 className="font-serif text-xl text-neutral-200">Fresh Coconut (Quả dừa)</h4>
                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                      A premium refreshing option introduced to meet student demands during blistering summer terms. Sourced from morning fruit arrivals to keep up with the sidewalk crowd.
                    </p>
                  </div>

                  <Universal3DViewer 
                    title="Fresh Coconut Scan"
                    meshId="9f16b22af8ea4bfa8ef0e180ca0c58fd" 
                    splatUrl="https://superspl.at/s?id=4b618e5b" 
                  />

                  
                </div>

              </div>
            </div>

            <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-850 space-y-4">
              <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block">Structural Legacy & Trust</span>
              <p className="text-neutral-300 text-sm md:text-base font-light leading-relaxed">
                To make more room for the “tea stall” and interface directly with high school crowds, she broke a section of the courtyard flat wall on Quang Trung street.
              </p>
              <div className="pt-2">
                <button 
                  onClick={() => navigateToSegment('seg-4')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-semibold rounded font-mono text-xs transition-all flex items-center space-x-2"
                >
                  <span>🧱 Play Wall Breaker Interview Segment</span>
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 5: 32 TAELS OF GOLD AND BEYOND */}
        <section className="bg-[#241a15] py-24 px-4 md:px-8 border-b border-neutral-900 text-[#f5f1ea] section-shadow-top">
          <div className="max-w-6xl mx-auto space-y-12">
            
            <div className="flex items-center space-x-2 text-xs font-mono text-amber-500/80">
              <span>05. COINS & GOLD LEGACIES // FEATURE: BÀ NGOẠI</span>
              <span className="w-12 h-px bg-amber-500/30"></span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <h2 className="font-serif text-3xl md:text-5xl text-neutral-100 font-bold tracking-tight">
                  32 Taels of Gold and the end of it
                </h2>

                <div className="prose prose-invert text-neutral-300 text-base md:text-lg font-light leading-relaxed space-y-6 max-w-none">
                  <p>
                    The shop ran like this for years. Small sales, repeated every day.
                  </p>
                  <p className="font-serif italic text-amber-200">
                    One cup. One snack. Another cup. Another afternoon.
                  </p>
                  <p>
                    After five years, she had saved enough to buy 32 taels of gold.
                  </p>
                  <p>
                    Eventually, she bought another house and rented this place out. But when people talk about the shop now, they almost never talk about the money.
                  </p>
                  <p>
                    They talk about where they used to sit. They talk about who they used to come with. They talk about the feeling of leaving school and already knowing where they would go next.
                  </p>
                  <p className="border-l-2 border-amber-600 pl-4 py-2 italic text-sm text-neutral-400">
                    The tea shop became part of ordinary life for so many people that it no longer felt like a business. It simply felt permanent.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-6 w-full">
                <div className="bg-neutral-950 p-2 rounded-2xl border border-neutral-900 shadow-2xl overflow-hidden relative h-[424px] flex items-center justify-center">
                  <iframe 
                    frameBorder="0" 
                    className="juxtapose w-full h-[408px] rounded-xl" 
                    src="https://cdn.knightlab.com/libs/juxtapose/latest/embed/index.html?uid=f346831a-5cfb-11f1-ba1b-0e6f42328d7d"
                    allowFullScreen
                    loading="lazy"
                    title="Hanoi Sidewalk Historical Transformation Slider"
                  />
                </div>
              </div>
            </div>

            <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-900 space-y-4 mt-6">
              <h4 className="font-serif text-base text-neutral-300">Then & Now Juxtaposition</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-neutral-400">
                <div className="p-4 bg-neutral-900 rounded border border-neutral-850">
                  <span className="text-amber-500 block text-sm mb-1">PAST: THE SIDEWALK LABYRINTH</span>
                  It was a small, narrow space. A few plastic stools. Snacks hanging from metal hooks. Ice in a blue cooler. Tea poured into glass cups that were used over and over again throughout the day, just the same as every other tea stall in Hanoi.
                </div>
                <div className="p-4 bg-neutral-900 rounded border border-neutral-850">
                  <span className="text-amber-500 block text-sm mb-1">PRESENT: CONGESTED URBAN HIGHWAY</span>
                  Even after rented out, the tea stall seems like it’s still there. But the street has become louder, faster, and more modern. Many old sidewalk tea stalls across Hanoi have disappeared, replaced by newer buildings and businesses, but well, this one remains.
                </div>
              </div>
              <div className="pt-2 text-center">
                <button 
                  onClick={() => navigateToSegment('seg-5')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-semibold rounded font-mono text-xs transition-all"
                >
                  💰 Open Gold & Inheritance Oral Chapter
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 6: CONCLUSION */}
        <section className="bg-[#090b09] py-24 px-4 md:px-8 border-b border-neutral-950">
          <div className="max-w-4xl mx-auto space-y-8 text-center">
            <div className="w-12 h-1 bg-amber-500 mx-auto"></div>
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-100 font-bold">In Memoriam</h2>
            <div className="prose prose-invert text-neutral-400 text-sm md:text-base leading-relaxed space-y-6 max-w-2xl mx-auto font-light">
              <p>
                Today, the street outside Viet Duc High School is louder, faster, and more modern than before. Many old sidewalk tea stalls across Hanoi have disappeared, replaced by newer buildings and businesses. Yet for many former students, memories of this small tea stall still remain strangely clear.
              </p>
              <p>
                The place is built on everything that happened around it: waiting for friends after class, sharing snacks during rainy afternoons, sitting on plastic stools long after the school bell had rung.
              </p>
              <p className="font-serif italic text-amber-400 text-base">
                At 42k Ly Thuong Kiet, what once looked like an ordinary sidewalk tea stall quietly became a part of growing up for generations of students in Hanoi.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 7: PROCESS DOCUMENTATION */}
        <section className="bg-[#111412] py-24 px-4 md:px-8 border-t border-neutral-900 text-neutral-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Field Journal Reflections */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center space-x-2 text-xs font-mono text-emerald-500">
                  <span>06 / EXPERIMENTAL DIGITIZATION FIELD JOURNAL</span>
                  <span className="w-12 h-px bg-emerald-500/30"></span>
                </div>
                
                <h2 className="font-serif text-3xl md:text-5xl text-neutral-100 font-bold tracking-tight">
                  Process Documentation
                </h2>
                <div className="text-neutral-400 text-sm md:text-base font-light leading-relaxed space-y-4">
                  <p>
                    For the oral history interviews, we recorded on-site conversations with grandma. But due to the nature of old people, we had to be flexible and adapt to her schedule and mood. We had to wait for her to feel like talking, and sometimes we had to ask the same question multiple times in different ways to get the information we needed. She was not used to talking about her life in a structured way, so we had to piece together the story from different conversations and memories. It was a challenging but rewarding process that allowed us to capture the essence of her experiences and the history of the tea stall.
                  </p>
                  <p>
                    For the scanning process, we traveled to the location and struggled a lot in asking the people to scan the objects. Grandma hasn’t been there for a long time, so we were just making a deal with complete strangers. We managed to capture several objects and spaces (and failed). Some objects had to be bought home (yogurt) to be photographed, a few borrowed from people we know.
                  </p>
                </div>
              </div>

              {/* Right Column: Archival Portrait Frame (Fills the gap circled in image_4f555d.jpg) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="p-2 bg-neutral-950/60 rounded-xl border border-neutral-900 group w-full max-w-[380px] shadow-2xl">
                  <div className="w-full h-[280px] sm:h-[320px] overflow-hidden rounded-lg bg-neutral-900 border border-neutral-850">
                    <img
                      src={selfie2BaChau}
                      alt="Selfie with Grandma"
                      className="w-full h-full object-cover transform transition-all duration-500 ease-out hover:scale-105 filter brightness-95 contrast-105 select-none"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Photo Caption Metadata */}
                  <div className="w-full text-center pt-3 pb-1 px-2">
                    <span className="text-[10px] font-mono text-amber-200 uppercase tracking-widest block mb-1">
                      Photo After Interviewed Grandma at Her Home
                    </span>
                    <p className="text-xs font-sans text-neutral-200 leading-relaxed font-light">
                      She is still doing well! We had a wonderful time talking to her and learning about her life and the history of the tea stall.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          <div className="max-w-6xl mx-auto mt-24 pt-16 border-t border-neutral-800/60 space-y-16">
            <div className="space-y-8">
              <h3 className="font-serif text-2xl text-neutral-200">The Anatomy of Failed Capture Attempts</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-900 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest block">Failed Scan 01</span>
                    <h4 className="font-serif text-base text-neutral-100">“Vietnamese iced tea space”</h4>
                    <p className="text-xs text-neutral-200 leading-relaxed font-light">
                      The space inside the tea stall. It was dark inside and there are people sitting there so we could not capture the whole room.
                    </p>
                  </div>
                  <div className="h-48 rounded bg-neutral-900 overflow-hidden border border-neutral-850">
                    <iframe 
                      title="Vietnamese iced tea space" 
                      className="w-full h-full border-0"
                      allowFullScreen 
                      allow="autoplay; fullscreen; xr-spatial-tracking" 
                      src="https://sketchfab.com/models/bd889b451c9a4019964d5d070d4f07d1/embed?autostart=0&preload=1"
                    />
                  </div>
                </div>

                <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-900 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest block">Failed Scan 02</span>
                    <h4 className="font-serif text-base text-neutral-100">“Viet Duc High School”</h4>
                    <p className="text-xs text-neutral-200 leading-relaxed font-light">
                      The space was too broad and we were standing in the BLASTING sun. We should have learned to do this beforehand, and better.
                    </p>
                  </div>
                  <div className="h-48 rounded bg-neutral-900 overflow-hidden border border-neutral-850">
                    <iframe 
                      title="cong truong viet duc" 
                      className="w-full h-full border-0"
                      allowFullScreen 
                      allow="autoplay; fullscreen; xr-spatial-tracking" 
                      src="https://sketchfab.com/models/45c999ce25474227ba08d36662cdaa0f/embed?autostart=0&preload=1"
                    />
                  </div>
                </div>

                <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-900 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest block">Failed Scan 03</span>
                    <h4 className="font-serif text-base text-neutral-100">“1 tea cup”</h4>
                    <p className="text-xs text-neutral-200 leading-relaxed font-light">
                      It was hard, even with mesh, to work with transparent objects. The owner looked proud bringing us this chilly cup, not knowing we suffered under it.
                    </p>
                  </div>
                  <div className="h-48 rounded bg-neutral-900 overflow-hidden border border-neutral-850">
                    <iframe 
                      title="failed tea cup" 
                      className="w-full h-full border-0"
                      allowFullScreen 
                      allow="autoplay; fullscreen; xr-spatial-tracking" 
                      src="https://sketchfab.com/models/af754ecc6779424fb8eee25053dc36f6/embed?autostart=0&preload=1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-neutral-900">
              <div className="space-y-3">
                <h4 className="font-serif text-lg text-neutral-100">Acknowledgement</h4>
                <p className="text-xs text-neutral-200 leading-relaxed font-light">
                  We express sincere gratitude to the local sidewalk vendors, our supportive classmates, the current students of Việt Đức High School who tolerated our scanning arrays, and the passersby of Hoan Kiem District who generously shared their afternoons, coffee tables, and memories with our research collective.
                </p>
                <p className="text-xs text-neutral-200 leading-relaxed font-light">
                  AI was also heavily involved in the writing and editing process of this project, from drafting interview questions to refining the narrative flow. We acknowledge the role of AI as a collaborative tool that helped us shape and articulate the stories we wanted to tell, while all the core content and insights were derived from our human interactions and research. Especially massive thanks to ChatGPT for helping us turn grandma's fragmented memories into a coherent narrative, and for assisting in the structuring of this article. We also used AI to help us generate the web and act as a coding assistant for the interactive elements, but all the final decisions and implementations were made by our team.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-serif text-lg text-neutral-100">Reflection</h4>
                <p className="text-xs text-neutral-200 leading-relaxed font-light">
                  This project is not simply an exercise in photogrammetry or 3D point generation. It is a critical inquiry into how spatial environments carry memory. A single plastic chair or glass tea cup holds generations of stories. In digitizing these artifacts, we save not just a model, but the small, ephemeral instances of community solidarity that define the soul of Hanoi.
                </p>
                <p className="text-xs text-neutral-200 leading-relaxed font-light">
                  We hope this project serves as a prototype for future digital preservation efforts that seek to capture the intangible cultural heritage embedded in everyday spaces. By combining oral histories, 3D scanning, and interactive storytelling, we can create richer, more immersive archives that honor the lived experiences of communities and the environments they inhabit.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-24 border-t border-neutral-950 pt-12 pb-16 px-4 text-center text-[10px] text-neutral-600 font-mono space-y-2">
          <p>© 2026 Sidewalk Iced Tea Preservation Laboratory. Hoan Kiem, Hanoi.</p>
          <p>Cultural digital preservation dataset licensed under Attribution-NonCommercial-NoDerivatives.</p>
        </footer>

      </div>

      {/* INTEGRATED TRANSCRIPT SIDE PANEL (WITH WORKING PLAYER) */}
      {!isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="fixed bottom-8 right-8 z-30 px-6 py-4 bg-amber-600 hover:bg-amber-500 text-black font-bold font-mono text-xs tracking-wider uppercase rounded-full shadow-2xl flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          <span>Explore Oral History Transcript</span>
        </button>
      )}

      <div
        className={`fixed top-0 right-0 h-screen z-40 bg-[#121513] border-l border-l-neutral-800 shadow-2xl transition-all duration-300 flex flex-col ${
          isPanelOpen ? 'w-full md:w-[480px] lg:w-[540px]' : 'w-0 pointer-events-none border-l-0'
        }`}
      >
        {isPanelOpen && (
          <>
            <div className="p-4 md:p-6 bg-[#0c0e0c] border-b border-neutral-800 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
                  Archival Record Ref: #005-QT
                </span>
                <h2 className="font-serif text-lg md:text-xl text-neutral-100 font-bold">
                  Oral History: Grandma's Memoir Highlights
                </h2>
              </div>
              
              <button
                onClick={() => {
                  setIsPanelOpen(false);
                  if (currentAudioRef.current) {
                    currentAudioRef.current.pause();
                    setPlayingAudioId(null);
                  }
                }}
                className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-100 transition-all"
                title="Minimize Panel"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 bg-neutral-950/80 border-b border-neutral-900 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-neutral-400 border border-neutral-850 p-2 rounded bg-[#171a17]/50">
                <div>
                  <span className="text-neutral-500">SUBJECT:</span> Bao Phuong's Grandma
                </div>
                <div>
                  <span className="text-neutral-500">AGE:</span> 85 yrs old
                </div>
                <div>
                  <span className="text-neutral-500">ORIGIN:</span> Thanh Hóa
                </div>
                <div>
                  <span className="text-neutral-500">LOC:</span> No. 5 Quang Trung
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-500">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by keyword (e.g., gold, wall)..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 pl-8 text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-neutral-600"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-2 text-[10px] font-mono text-neutral-500 hover:text-neutral-300"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex bg-neutral-900 p-0.5 rounded border border-neutral-800 shrink-0">
                  <button
                    onClick={() => setIsEnglish(false)}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-semibold transition-all ${
                      !isEnglish ? 'bg-amber-600 text-black' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    VN
                  </button>
                  <button
                    onClick={() => setIsEnglish(true)}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-semibold transition-all ${
                      isEnglish ? 'bg-amber-600 text-black' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gradient-to-b from-[#121513] to-[#0c0d0c] custom-scrollbar">
              {filteredSegments.length > 0 ? (
                filteredSegments.map((seg) => {
                  const isFocused = activeSegment === seg.id;
                  const isAudioPlaying = playingAudioId === seg.id;
                  
                  return (
                    <div
                      key={seg.id}
                      id={seg.id}
                      onClick={() => setActiveSegment(seg.id)}
                      className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                        isFocused
                          ? 'bg-amber-950/20 border-amber-500 shadow-md shadow-amber-950/10'
                          : 'bg-neutral-900/30 border-neutral-850 hover:border-neutral-800'
                      } ${isAudioPlaying ? 'ring-1 ring-amber-500/50 bg-amber-950/10' : ''}`}
                    >
                      {isFocused && (
                        <div className="absolute top-0 left-4 -translate-y-1/2 px-2 py-0.5 bg-amber-500 text-black font-mono text-[9px] font-bold rounded uppercase tracking-wider">
                          Active Timeline Focus
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-neutral-500">{seg.speaker}</span>
                          <span className="text-neutral-700 text-[10px]">•</span>
                          <span className="px-1.5 py-0.5 rounded bg-neutral-950 text-[10px] font-mono text-amber-500 border border-neutral-850">
                            {seg.timestamp}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-600 group-hover:text-amber-500/80 transition-colors">
                          {seg.topic}
                        </span>
                      </div>

                      <p className="text-neutral-200 text-sm md:text-[14px] leading-relaxed font-light transition-all duration-300">
                        {isEnglish ? seg.english : seg.vietnamese}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-neutral-850/60 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                        <div className="flex items-center space-x-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isAudioPlaying ? 'bg-emerald-500 animate-ping' : 'bg-amber-500/60'}`}></span>
                          <span>Chau's Tape Segment {seg.id.split('-')[1]}</span>
                        </div>
                        
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSegmentAudio(seg.id);
                          }}
                          className={`px-2 py-1 rounded border transition-all flex items-center space-x-1 ${
                            isAudioPlaying 
                              ? 'bg-amber-600 border-amber-500 text-black font-bold' 
                              : 'text-neutral-500 border-neutral-800 hover:text-amber-500 hover:border-amber-500/30 bg-neutral-950/40'
                          }`}
                        >
                          {isAudioPlaying ? (
                            <>
                              <svg className="w-3 h-3 animate-spin mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              </svg>
                              <span>Playing Tape...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                              <span>Play Segment</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-neutral-850 rounded-xl">
                  <span className="text-2xl">⏳</span>
                  <p className="text-xs text-neutral-500 font-mono">No matching oral memories found.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#0c0e0c] border-t border-neutral-800 text-[10px] font-mono text-neutral-500 flex justify-between items-center">
              <span>Bảo Phương & Grandma Memoir</span>
              <div className="flex space-x-3">
                <button className="hover:text-neutral-300">Download Transcript</button>
              </div>
            </div>
          </>
        )}
      </div>

      <GrandmaChat isTranscriptOpen={isPanelOpen} />

    </div>
  );
}