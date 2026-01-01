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

// Fichier audio de méditation local
const BACKGROUND_MUSIC_URL = "/sound/desert_sand.mp3";

export const BodyScan = ({ onComplete, completed }: BodyScanProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isComplete, setIsComplete] = useState(completed);
  const [eyesClosed, setEyesClosed] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isWaitingForVoice, setIsWaitingForVoice] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<OscillatorNode | null>(null);
  const voiceStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const musicStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  
  // Mettre à jour la ref quand onComplete change
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const totalDuration = bodyParts.reduce((sum, part) => sum + part.duration, 0);
  const elapsedDuration = bodyParts.slice(0, currentIndex).reduce((sum, part) => sum + part.duration, 0) + 
    (isRunning ? bodyParts[currentIndex]?.duration - timeRemaining : 0);
  const progress = (elapsedDuration / totalDuration) * 100;

  // Sélectionner la meilleure voix disponible (la plus humaine et apaisante)
  const selectBestVoice = () => {
    if (!('speechSynthesis' in window)) return null;
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;
    
    // Prioriser les voix les plus humaines et apaisantes (voix premium)
    // Les voix Google et certaines voix système sont généralement les plus naturelles
    const preferredVoices = [
      'Google UK English Female',      // Très naturelle et douce
      'Google US English Female',      // Très naturelle et douce
      'Microsoft Zira',                // Voix Microsoft naturelle
      'Microsoft Hazel',               // Voix Microsoft douce
      'Samantha',                      // Voix Mac très naturelle
      'Karen',                         // Voix Mac apaisante
      'Victoria',                      // Voix Mac douce
      'Alex',                          // Voix Mac alternative
      'Google UK English Male',        // Alternative masculine douce
      'Google US English Male',        // Alternative masculine douce
    ];
    
    // Chercher une voix préférée (priorité aux voix féminines)
    for (const preferred of preferredVoices) {
      const voice = voices.find(v => 
        v.name.includes(preferred) && 
        (preferred.includes('Female') || preferred.includes('Samantha') || 
         preferred.includes('Karen') || preferred.includes('Victoria') || 
         preferred.includes('Hazel') || preferred.includes('Zira'))
      );
      if (voice) return voice;
    }
    
    // Sinon, chercher n'importe quelle voix préférée
    for (const preferred of preferredVoices) {
      const voice = voices.find(v => v.name.includes(preferred));
      if (voice) return voice;
    }
    
    // Sinon, chercher une voix féminine anglaise (généralement plus douce)
    const femaleVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('female') || 
       v.name.toLowerCase().includes('woman') ||
       v.name.toLowerCase().includes('samantha') ||
       v.name.toLowerCase().includes('karen') ||
       v.name.toLowerCase().includes('victoria') ||
       v.name.toLowerCase().includes('hazel') ||
       v.name.toLowerCase().includes('zira'))
    );
    if (femaleVoice) return femaleVoice;
    
    // Sinon, prendre la première voix anglaise
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    return englishVoice || voices[0];
  };

  // Initialiser la voix au chargement
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log("Voix disponibles:", voices.length, voices.map(v => v.name));
      selectedVoiceRef.current = selectBestVoice();
      if (selectedVoiceRef.current) {
        console.log("Voix sélectionnée:", selectedVoiceRef.current.name);
      } else {
        console.warn("Aucune voix sélectionnée!");
      }
    };
    
    // Charger immédiatement
    loadVoices();
    
    // Certains navigateurs chargent les voix de manière asynchrone
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Forcer le chargement des voix en faisant un appel à getVoices
    // Certains navigateurs nécessitent cela
    setTimeout(() => {
      window.speechSynthesis.getVoices();
      loadVoices();
    }, 100);
  }, []);

  // Fonction pour lire une instruction à voix haute avec une voix très humaine et apaisante
  const speakInstruction = (text: string, force = false) => {
    // Arrêter toute synthèse vocale en cours
    window.speechSynthesis.cancel();

    if (!('speechSynthesis' in window)) {
      console.error("La synthèse vocale n'est pas disponible dans ce navigateur");
      return;
    }

    // Vérifier que la synthèse vocale n'est pas en cours d'utilisation
    if (window.speechSynthesis.speaking && !force) {
      console.log("Synthèse vocale déjà en cours, attente...");
      setTimeout(() => speakInstruction(text, true), 500);
      return;
    }

    // Recharger les voix si nécessaire
    if (!selectedVoiceRef.current) {
      selectedVoiceRef.current = selectBestVoice();
    }
    
    // Améliorer le texte pour une lecture plus naturelle et apaisante
    // Ajouter des pauses naturelles pour un rythme plus humain
    const naturalText = text
      .replace(/\. /g, '... ') // Pause plus longue après les points
      .replace(/, /g, '... ')  // Pause après les virgules
      .replace(/\s+/g, ' ')    // Normaliser les espaces
      .trim();
    
    if (!naturalText) {
      console.error("Texte vide, impossible de lire");
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(naturalText);
    utterance.lang = 'en-US';
    
    // Paramètres optimisés pour une voix très humaine et apaisante (soothing)
    utterance.rate = 0.75;  // Vitesse encore plus lente pour un rythme très calme et naturel
    utterance.pitch = 0.88;  // Pitch plus bas pour un ton très chaleureux et apaisant
    utterance.volume = 1.0; // Volume maximum pour être sûr que la voix est audible
    
    // Utiliser la meilleure voix disponible
    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
      console.log("Utilisation de la voix apaisante:", selectedVoiceRef.current.name);
    } else {
      console.log("Aucune voix sélectionnée, utilisation de la voix par défaut");
    }
    
    // Baisser le volume de la musique pendant que la voix parle
    if (audioRef.current) {
      audioRef.current.volume = 0.1; // Volume très bas pendant la voix
    }
    
    // Remettre le volume de la musique après la fin de la voix
    utterance.onend = () => {
      console.log("Lecture vocale terminée");
      if (audioRef.current) {
        audioRef.current.volume = 0.3; // Remettre le volume normal
      }
      
      // Si c'est le dernier message (body scan completed), arrêter la musique après 30 secondes
      if (text.includes("Body scan completed")) {
        console.log("Dernier guide vocal terminé, arrêt de la musique dans 30 secondes");
        // Nettoyer le timeout précédent s'il existe
        if (musicStopTimeoutRef.current) {
          clearTimeout(musicStopTimeoutRef.current);
        }
        // Arrêter la musique 30 secondes après la fin du dernier guide vocal
        musicStopTimeoutRef.current = setTimeout(() => {
          console.log("Arrêt de la musique 30 secondes après la fin du guide vocal");
          stopBackgroundMusic();
          onCompleteRef.current();
        }, 30000); // 30 secondes après la fin du guide vocal
      }
    };
    
    utterance.onstart = () => {
      console.log("Lecture vocale démarrée");
    };
    
    utterance.onerror = (event) => {
      console.error("Erreur de synthèse vocale:", event.error, event);
      if (audioRef.current) {
        audioRef.current.volume = 0.3; // Remettre le volume en cas d'erreur
      }
    };
    
    speechSynthesisRef.current = utterance;
    
    // Lire immédiatement
    console.log("Tentative de lecture de l'instruction:", naturalText);
    try {
      window.speechSynthesis.speak(utterance);
      console.log("Commande de lecture envoyée à la synthèse vocale");
    } catch (error) {
      console.error("Erreur lors de l'appel à speak:", error);
    }
  };

  // Démarrer la musique de fond (fichier local)
  const startBackgroundMusic = () => {
    if (!musicEnabled) return;
    
    // Si l'audio existe déjà et fonctionne, juste le relancer
    if (audioRef.current && !audioRef.current.error) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.log("Impossible de relancer la musique:", error);
      });
      setIsMusicPlaying(true);
      return;
    }
    
    // Créer un nouvel élément audio avec le fichier local
    const audio = new Audio(BACKGROUND_MUSIC_URL);
    audio.loop = false; // Ne pas boucler, on gère la durée manuellement
    audio.volume = 0.3; // Volume bas pour ne pas gêner
    audio.preload = 'auto';
    
    // Stocker les handlers pour pouvoir les retirer plus tard
    const canPlayHandler = () => {
      // Ne jouer que si la musique est toujours activée et n'a pas été arrêtée
      if (musicEnabled && audioRef.current === audio) {
        audio.play().catch((error) => {
          console.log("Lecture de la musique différée:", error);
        });
      }
    };
    
    const errorHandler = (e: Event) => {
      console.log("Erreur de chargement de la musique:", e);
      setMusicEnabled(false);
      setIsMusicPlaying(false);
    };
    
    const playingHandler = () => {
      // Ne loguer que si c'est bien notre audio
      if (audioRef.current === audio) {
        console.log("Musique de fond démarrée avec succès");
        setIsMusicPlaying(true);
      }
    };
    
    const endedHandler = () => {
      if (audioRef.current === audio) {
        console.log("Musique terminée");
        setIsMusicPlaying(false);
      }
    };
    
    // Ajouter les event listeners
    audio.addEventListener('canplay', canPlayHandler);
    audio.addEventListener('error', errorHandler);
    audio.addEventListener('playing', playingHandler);
    audio.addEventListener('ended', endedHandler);
    
    // Stocker les handlers sur l'élément audio pour pouvoir les retirer
    (audio as any)._canPlayHandler = canPlayHandler;
    (audio as any)._errorHandler = errorHandler;
    (audio as any)._playingHandler = playingHandler;
    (audio as any)._endedHandler = endedHandler;
    
    audioRef.current = audio;
    
    // Essayer de charger et jouer immédiatement
    audio.load();
    audio.play().catch((error) => {
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
      
      // Créer une musique de méditation apaisante avec des fréquences de résonance
      // Utiliser des fréquences binaurales et de résonance de la Terre pour un effet apaisant
      const baseFreq = 60; // Fréquence basse apaisante (environ 60Hz - note basse)
      const meditationFreqs = [
        baseFreq,           // Fond basse
        baseFreq * 1.5,     // Harmonique douce
        baseFreq * 2,       // Octave supérieure
      ];
      
      const oscillators: OscillatorNode[] = [];
      const gainNodes: GainNode[] = [];
      
      // Créer plusieurs couches pour un son plus riche et apaisant
      meditationFreqs.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine'; // Son le plus doux possible
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        
        // Volume décroissant pour créer une ambiance subtile et apaisante
        const volume = 0.02 / (index + 1); // Volume très bas pour ne pas gêner
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        
        // Légère variation lente pour créer un effet de "respiration" apaisant
        if (index > 0) {
          const variation = freq * 0.01; // Variation de 1%
          oscillator.frequency.exponentialRampToValueAtTime(
            freq + variation, 
            audioContext.currentTime + 20
          );
          oscillator.frequency.exponentialRampToValueAtTime(
            freq, 
            audioContext.currentTime + 40
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
      
      console.log("Musique de méditation apaisante générée avec Web Audio API (fallback)");
      return true;
    } catch (error) {
      console.log("Impossible de générer la musique avec Web Audio API:", error);
      return false;
    }
  };

  // Arrêter la musique de fond avec un fade-out progressif
  const stopBackgroundMusic = (fadeOutDuration = 2000) => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const startVolume = audio.volume;
      const fadeOutSteps = 20; // Nombre d'étapes pour le fade-out
      const stepDuration = fadeOutDuration / fadeOutSteps;
      const volumeStep = startVolume / fadeOutSteps;
      
      console.log("Début du fade-out de la musique");
      
      // Fonction pour diminuer progressivement le volume
      const fadeOut = () => {
        if (!audioRef.current || audioRef.current !== audio) {
          return; // La musique a déjà été arrêtée
        }
        
        const currentVolume = audio.volume;
        if (currentVolume > 0) {
          // Diminuer le volume
          audio.volume = Math.max(0, currentVolume - volumeStep);
          
          // Continuer le fade-out
          setTimeout(fadeOut, stepDuration);
        } else {
          // Volume à 0, arrêter complètement
          console.log("Fade-out terminé, arrêt définitif de la musique");
          
          // Retirer tous les event listeners pour éviter qu'ils se déclenchent après l'arrêt
          if ((audio as any)._canPlayHandler) {
            audio.removeEventListener('canplay', (audio as any)._canPlayHandler);
          }
          if ((audio as any)._errorHandler) {
            audio.removeEventListener('error', (audio as any)._errorHandler);
          }
          if ((audio as any)._playingHandler) {
            audio.removeEventListener('playing', (audio as any)._playingHandler);
          }
          if ((audio as any)._endedHandler) {
            audio.removeEventListener('ended', (audio as any)._endedHandler);
          }
          
          // Arrêter et nettoyer
          audio.pause();
          audio.currentTime = 0;
          audio.src = ''; // Vider la source pour empêcher tout redémarrage
          audioRef.current = null;
          setIsMusicPlaying(false);
        }
      };
      
      // Démarrer le fade-out
      fadeOut();
    }
    
    // Pour la musique générée avec Web Audio API, arrêt simple
    // (Le fade-out complexe nécessiterait de refactoriser la génération de musique)
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    
    if (audioContextRef.current) {
      // Attendre un peu avant de fermer le contexte audio
      setTimeout(() => {
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }
      }, fadeOutDuration + 100);
    }
  };

  // Nettoyer les ressources audio
  const cleanupAudio = () => {
    stopBackgroundMusic();
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }
  };

  // Lire l'instruction quand on change de partie du corps (seulement après le délai de 30s)
  useEffect(() => {
    if (isRunning && !isWaitingForVoice && currentIndex < bodyParts.length) {
      const currentPart = bodyParts[currentIndex];
      const fullInstruction = `${currentPart.name}. ${currentPart.instruction}`;
      console.log("Démarrage de la lecture vocale pour:", fullInstruction);
      console.log("Voix disponible:", selectedVoiceRef.current?.name || "aucune");
      speakInstruction(fullInstruction);
    }
  }, [currentIndex, isRunning, isWaitingForVoice]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev > 1) return prev - 1;
        
        if (currentIndex < bodyParts.length - 1) {
          setCurrentIndex(i => i + 1);
          return bodyParts[currentIndex + 1].duration;
        } else {
          // Fin du body scan - le dernier guide vocal sera lu et déclenchera l'arrêt de la musique
          setIsRunning(false);
          setIsComplete(true);
          
          // Lire le message de fin
          // Le timer de 30 secondes sera déclenché dans utterance.onend de speakInstruction
          setTimeout(() => {
            speakInstruction("Body scan completed. Take a moment to notice how you feel.");
          }, 500);
          
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, currentIndex, onComplete]);

  const start = () => {
    // Vérifier que la synthèse vocale est disponible
    if (!('speechSynthesis' in window)) {
      console.error("La synthèse vocale n'est pas disponible!");
      alert("La synthèse vocale n'est pas disponible dans votre navigateur. Veuillez utiliser Chrome, Edge ou Safari.");
      return;
    }
    
    // S'assurer que les voix sont chargées
    const voices = window.speechSynthesis.getVoices();
    console.log("Voix disponibles au démarrage:", voices.length);
    if (voices.length === 0) {
      console.warn("Aucune voix disponible, attente du chargement...");
      // Attendre que les voix se chargent
      const checkVoices = setInterval(() => {
        const newVoices = window.speechSynthesis.getVoices();
        if (newVoices.length > 0) {
          clearInterval(checkVoices);
          selectedVoiceRef.current = selectBestVoice();
          console.log("Voix chargées:", newVoices.length);
        }
      }, 100);
      
      setTimeout(() => clearInterval(checkVoices), 5000); // Timeout après 5 secondes
    } else {
      selectedVoiceRef.current = selectBestVoice();
    }
    
    // Tester la synthèse vocale immédiatement pour "activer" l'API
    // Cela permet de contourner les restrictions du navigateur
    try {
      const testUtterance = new SpeechSynthesisUtterance('Test');
      testUtterance.volume = 0.01; // Très bas mais pas 0
      testUtterance.rate = 10; // Très rapide
      testUtterance.onstart = () => {
        window.speechSynthesis.cancel(); // Annuler immédiatement
        console.log("Test de synthèse vocale réussi - API activée");
      };
      window.speechSynthesis.speak(testUtterance);
    } catch (error) {
      console.error("Erreur lors du test de synthèse vocale:", error);
    }
    
    // Démarrer la musique immédiatement
    startBackgroundMusic();
    setEyesClosed(true);
    
    // Attendre 30 secondes avant de commencer le guide vocal
    setIsWaitingForVoice(true);
    if (voiceStartTimeoutRef.current) {
      clearTimeout(voiceStartTimeoutRef.current);
    }
    
    voiceStartTimeoutRef.current = setTimeout(() => {
      console.log("30 secondes écoulées, démarrage du guide vocal");
      setIsWaitingForVoice(false);
      setCurrentIndex(0);
      setTimeRemaining(bodyParts[0].duration);
      // setIsRunning(true) déclenchera automatiquement le useEffect qui lira la première instruction
      setIsRunning(true);
    }, 30000); // 30 secondes de délai
  };

  const stop = () => {
    setIsRunning(false);
    setEyesClosed(false);
    setIsWaitingForVoice(false);
    
    // Nettoyer les timeouts
    if (voiceStartTimeoutRef.current) {
      clearTimeout(voiceStartTimeoutRef.current);
      voiceStartTimeoutRef.current = null;
    }
    if (musicStopTimeoutRef.current) {
      clearTimeout(musicStopTimeoutRef.current);
      musicStopTimeoutRef.current = null;
    }
    
    cleanupAudio();
  };

  // Nettoyer les ressources quand le composant est démonté
  useEffect(() => {
    return () => {
      if (voiceStartTimeoutRef.current) {
        clearTimeout(voiceStartTimeoutRef.current);
      }
      if (musicStopTimeoutRef.current) {
        clearTimeout(musicStopTimeoutRef.current);
      }
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
      {eyesClosed && (isRunning || isWaitingForVoice) && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center transition-opacity duration-500"
          onClick={stop}
        >
          <div className="text-center text-white/60 px-6">
            {isWaitingForVoice ? (
              <>
                <p className="text-lg mb-4">Fermez les yeux et écoutez la musique...</p>
                <p className="text-sm">Le guide vocal commencera dans quelques instants</p>
              </>
            ) : (
              <>
                <p className="text-lg mb-4">Fermez les yeux et écoutez...</p>
                <p className="text-sm">Appuyez n'importe où pour arrêter</p>
              </>
            )}
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

        {(isRunning || isWaitingForVoice) ? (
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
            
            {isWaitingForVoice ? (
              <div className="text-center py-4">
                <p className="text-lg font-semibold text-primary mb-2">
                  Écoutez la musique...
                </p>
                <p className="text-muted-foreground">
                  Le guide vocal commencera dans quelques instants
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-lg font-semibold text-primary mb-2">
                  {bodyParts[currentIndex].name}
                </p>
                <p className="text-muted-foreground">
                  {bodyParts[currentIndex].instruction}
                </p>
              </div>
            )}

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
