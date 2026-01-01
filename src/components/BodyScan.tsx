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

// URL de musique de méditation (musique libre de droits)
// Alternative: vous pouvez remplacer par votre propre fichier audio dans le dossier public
const BACKGROUND_MUSIC_URL = "https://cdn.pixabay.com/download/audio/2022/03/15/audio_8b8c1e3f5c.mp3?filename=meditation-music-zen-11157.mp3";

export const BodyScan = ({ onComplete, completed }: BodyScanProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isComplete, setIsComplete] = useState(completed);
  const [eyesClosed, setEyesClosed] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const totalDuration = bodyParts.reduce((sum, part) => sum + part.duration, 0);
  const elapsedDuration = bodyParts.slice(0, currentIndex).reduce((sum, part) => sum + part.duration, 0) + 
    (isRunning ? bodyParts[currentIndex]?.duration - timeRemaining : 0);
  const progress = (elapsedDuration / totalDuration) * 100;

  // Fonction pour lire une instruction à voix haute
  const speakInstruction = (text: string) => {
    // Arrêter toute synthèse vocale en cours
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Vitesse légèrement ralentie pour la méditation
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Démarrer la musique de fond
  const startBackgroundMusic = () => {
    if (!musicEnabled) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio(BACKGROUND_MUSIC_URL);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.2; // Volume bas pour ne pas gêner
      audioRef.current.addEventListener('error', () => {
        console.log("Impossible de charger la musique de fond. Vous pouvez continuer sans musique.");
        setMusicEnabled(false);
      });
    }
    
    audioRef.current.play().catch((error) => {
      console.log("Impossible de lire la musique de fond:", error);
      // Désactiver la musique si elle ne peut pas être lue
      setMusicEnabled(false);
    });
  };

  // Arrêter la musique de fond
  const stopBackgroundMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
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
