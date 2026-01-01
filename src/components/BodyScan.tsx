import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Scan, Play, Check, Volume2, VolumeX } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface BodyScanProps {
  onComplete: () => void;
  completed: boolean;
}

const bodyParts = [
  { name: "Head & Face", duration: 10, instruction: "Relax your forehead, jaw, and facial muscles" },
  { name: "Neck & Shoulders", duration: 10, instruction: "Release any tension in your neck and drop your shoulders" },
  { name: "Arms & Hands", duration: 10, instruction: "Feel the weight of your arms, relax your fingers" },
  { name: "Chest & Stomach", duration: 10, instruction: "Notice your breathing, let your belly soften" },
  { name: "Back & Spine", duration: 10, instruction: "Feel your back supported, release any tightness" },
  { name: "Legs & Feet", duration: 10, instruction: "Relax your thighs, calves, and feet completely" },
];

// URLs de musique de méditation (plusieurs sources de fallback)
// Alternative: vous pouvez ajouter votre propre fichier audio dans le dossier public et utiliser "/meditation-music.mp3"
const BACKGROUND_MUSIC_URLS = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://archive.org/download/MeditationMusic/MeditationMusic.mp3", // Archive.org - source fiable
];

export const BodyScan = ({ onComplete, completed }: BodyScanProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isComplete, setIsComplete] = useState(completed);
  const [eyesClosed, setEyesClosed] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<OscillatorNode | null>(null);

  const totalDuration = bodyParts.reduce((sum, part) => sum + part.duration, 0);
  const elapsedDuration = bodyParts.slice(0, currentIndex).reduce((sum, part) => sum + part.duration, 0) + 
    (isRunning ? bodyParts[currentIndex]?.duration - timeRemaining : 0);
  const progress = (elapsedDuration / totalDuration) * 100;

  // Sélectionner la meilleure voix disponible
  const selectBestVoice = () => {
    if (!('speechSynthesis' in window)) return null;
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;
    
    // Prioriser les voix premium/naturelles (Google, Microsoft, etc.)
    const preferredVoices = [
      'Google UK English Female',
      'Google US English Female',
      'Microsoft Zira - English (United States)',
      'Microsoft Hazel - English (Great Britain)',
      'Samantha',
      'Karen',
      'Victoria'
    ];
    
    // Chercher une voix préférée
    for (const preferred of preferredVoices) {
      const voice = voices.find(v => v.name.includes(preferred));
      if (voice) return voice;
    }
    
    // Sinon, chercher une voix féminine anglaise
    const femaleVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('female') || 
       v.name.toLowerCase().includes('woman') ||
       v.name.toLowerCase().includes('samantha') ||
       v.name.toLowerCase().includes('karen') ||
       v.name.toLowerCase().includes('victoria'))
    );
    if (femaleVoice) return femaleVoice;
    
    // Sinon, prendre la première voix anglaise
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    return englishVoice || voices[0];
  };

  // Initialiser la voix au chargement
  useEffect(() => {
    const loadVoices = () => {
      selectedVoiceRef.current = selectBestVoice();
    };
    
    loadVoices();
    // Certains navigateurs chargent les voix de manière asynchrone
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Fonction pour lire une instruction à voix haute avec une voix plus naturelle
  const speakInstruction = (text: string) => {
    // Arrêter toute synthèse vocale en cours
    window.speechSynthesis.cancel();

    if ('speechSynthesis' in window) {
      // Recharger les voix si nécessaire
      if (!selectedVoiceRef.current) {
        selectedVoiceRef.current = selectBestVoice();
      }
      
      // Améliorer le texte pour une lecture plus naturelle
      // Remplacer les points par des pauses plus longues
      const naturalText = text
        .replace(/\. /g, '. ') // Garder les points mais avec espace
        .replace(/\s+/g, ' '); // Normaliser les espaces
      
      const utterance = new SpeechSynthesisUtterance(naturalText);
      utterance.lang = 'en-US';
      utterance.rate = 0.82; // Vitesse ralentie pour la méditation (plus naturel et calme)
      utterance.pitch = 0.92; // Pitch légèrement plus bas pour un son plus chaleureux et apaisant
      utterance.volume = 0.95;
      
      // Utiliser la meilleure voix disponible
      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
        console.log("Utilisation de la voix:", selectedVoiceRef.current.name);
      }
      
      speechSynthesisRef.current = utterance;
      
      // Lire avec un petit délai pour s'assurer que la musique est lancée
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 300);
    }
  };

  // Démarrer la musique de fond avec fallback sur plusieurs sources
  const startBackgroundMusic = (sourceIndex = 0) => {
    if (!musicEnabled) return;
    
    // Si l'audio existe déjà et fonctionne, juste le relancer
    if (audioRef.current && !audioRef.current.error) {
      audioRef.current.play().catch((error) => {
        console.log("Impossible de relancer la musique:", error);
      });
      return;
    }
    
    // Si on a épuisé toutes les sources, essayer de générer une musique
    if (sourceIndex >= BACKGROUND_MUSIC_URLS.length) {
      console.log("Toutes les sources de musique externes ont échoué. Génération d'une musique de fond...");
      if (!generateBackgroundMusic()) {
        console.log("Impossible de générer la musique. Continuez sans musique.");
        setMusicEnabled(false);
      }
      return;
    }
    
    // Créer un nouvel élément audio
    const audio = new Audio(BACKGROUND_MUSIC_URLS[sourceIndex]);
    audio.loop = true;
    audio.volume = 0.3; // Volume bas pour ne pas gêner
    audio.preload = 'auto';
    
    // Quand la musique est prête et peut être jouée
    audio.addEventListener('canplay', () => {
      audio.play().catch((error) => {
        // Erreur de lecture (peut nécessiter une interaction utilisateur)
        console.log("Lecture de la musique différée:", error);
      });
    });
    
    // Gérer les erreurs de chargement
    audio.addEventListener('error', (e) => {
      console.log(`Erreur avec la source ${sourceIndex + 1}, essai de la source suivante...`);
      // Essayer la source suivante
      startBackgroundMusic(sourceIndex + 1);
    });
    
    // Quand la musique commence à jouer
    audio.addEventListener('playing', () => {
      console.log("Musique de fond démarrée avec succès");
    });
    
    audioRef.current = audio;
    
    // Essayer de charger et jouer immédiatement
    audio.load();
    audio.play().catch((error) => {
      // Erreur normale si pas d'interaction utilisateur - la musique se lancera automatiquement
      console.log("Lecture différée (attente de l'interaction utilisateur)");
    });
  };

  // Générer une musique de fond apaisante avec Web Audio API
  const generateBackgroundMusic = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return false;
      
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      // Créer plusieurs oscillateurs pour un son plus riche et apaisant
      const frequencies = [220, 330, 440]; // Accords apaisants (A, E, A)
      const oscillators: OscillatorNode[] = [];
      const gainNodes: GainNode[] = [];
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine'; // Son doux
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        
        // Volume décroissant pour créer une ambiance
        const volume = 0.03 / (index + 1); // Volume plus bas pour les fréquences plus hautes
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        
        // Ajouter une légère variation pour éviter la monotonie
        if (index > 0) {
          oscillator.frequency.exponentialRampToValueAtTime(
            freq * 1.01, 
            audioContext.currentTime + 10
          );
        }
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillators.push(oscillator);
        gainNodes.push(gainNode);
      });
      
      // Stocker le premier oscillateur pour pouvoir l'arrêter
      audioSourceRef.current = oscillators[0];
      
      console.log("Musique de fond apaisante générée avec Web Audio API");
      return true;
    } catch (error) {
      console.log("Impossible de générer la musique avec Web Audio API:", error);
      return false;
    }
  };

  // Arrêter la musique de fond
  const stopBackgroundMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // Nettoyer les ressources audio
  const cleanupAudio = () => {
    stopBackgroundMusic();
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }
  };

  // Lire l'instruction quand on change de partie du corps
  useEffect(() => {
    if (isRunning && currentIndex < bodyParts.length) {
      const currentPart = bodyParts[currentIndex];
      const fullInstruction = `${currentPart.name}. ${currentPart.instruction}`;
      speakInstruction(fullInstruction);
    }
  }, [currentIndex, isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev > 1) return prev - 1;
        
        if (currentIndex < bodyParts.length - 1) {
          setCurrentIndex(i => i + 1);
          return bodyParts[currentIndex + 1].duration;
        } else {
          setIsRunning(false);
          setIsComplete(true);
          cleanupAudio();
          // Lire le message de fin
          setTimeout(() => {
            speakInstruction("Body scan completed. Take a moment to notice how you feel.");
          }, 500);
          onComplete();
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, currentIndex, onComplete]);

  const start = () => {
    setCurrentIndex(0);
    setTimeRemaining(bodyParts[0].duration);
    setIsRunning(true);
    setEyesClosed(true);
    startBackgroundMusic();
  };

  const stop = () => {
    setIsRunning(false);
    setEyesClosed(false);
    cleanupAudio();
  };

  // Nettoyer les ressources quand le composant est démonté
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  if (isComplete || completed) {
    return (
      <div className="flex items-center justify-center p-6 bg-primary/10 rounded-xl">
        <div className="flex items-center gap-3 text-primary">
          <Check className="h-6 w-6" />
          <span className="font-medium">Body scan completed!</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Overlay sombre pour le mode "yeux fermés" */}
      {eyesClosed && isRunning && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center transition-opacity duration-500"
          onClick={stop}
        >
          <div className="text-center text-white/60 px-6">
            <p className="text-lg mb-4">Fermez les yeux et écoutez...</p>
            <p className="text-sm">Appuyez n'importe où pour arrêter</p>
          </div>
        </div>
      )}

      <div className="space-y-6 p-6 bg-card/50 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary" />
            <span className="font-medium">60-Second Body Scan</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {isRunning ? `${Math.ceil(timeRemaining)}s` : "1 minute"}
          </span>
        </div>

        {isRunning ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <Progress value={progress} className="h-2 flex-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMusicEnabled(!musicEnabled);
                  if (musicEnabled) {
                    stopBackgroundMusic();
                  } else {
                    startBackgroundMusic();
                  }
                }}
                className="ml-2"
              >
                {musicEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="text-center py-4">
              <p className="text-lg font-semibold text-primary mb-2">
                {bodyParts[currentIndex].name}
              </p>
              <p className="text-muted-foreground">
                {bodyParts[currentIndex].instruction}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              {bodyParts.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index < currentIndex
                      ? "bg-primary"
                      : index === currentIndex
                      ? "bg-primary animate-pulse"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm" onClick={stop}>
                Arrêter
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-muted-foreground text-center">
              A guided journey through your body, releasing tension with each breath
            </p>
            <Button onClick={start} className="gap-2">
              <Play className="h-4 w-4" />
              Begin Body Scan
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Les instructions seront lues à voix haute avec une musique de fond
            </p>
          </div>
        )}
      </div>
    </>
  );
};
