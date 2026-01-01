import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sun, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { MoodSelector } from "@/components/MoodSelector";
import { SleepSlider } from "@/components/SleepSlider";
import { FeelingsInput } from "@/components/FeelingsInput";
import { GratitudeInput } from "@/components/GratitudeInput";
import { BreathingExercise } from "@/components/BreathingExercise";
import { BodyScan } from "@/components/BodyScan";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { saveMorningEntry, getTodaysMorningEntry, generateId, type MorningEntry } from "@/lib/storage";
import heroMorning from "@/assets/hero-morning.jpg";
import { toast } from "@/hooks/use-toast";

const steps = ["Mood", "Sleep", "Feelings", "Goals", "Gratitude", "Affirmation", "Grounding"];

const MorningIntentions = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const [formData, setFormData] = useState<Omit<MorningEntry, 'id' | 'date' | 'createdAt'>>({
    mood: 3,
    sleepHours: 7,
    feelings: [],
    dailyGoal: "",
    gratitude: ["", "", ""],
    affirmation: "",
    breathingCompleted: false,
    bodyScanCompleted: false,
    mindfulCheckinNotes: "",
  });

  useEffect(() => {
    const existing = getTodaysMorningEntry();
    if (existing) {
      setFormData({
        mood: existing.mood,
        sleepHours: existing.sleepHours,
        feelings: existing.feelings,
        dailyGoal: existing.dailyGoal,
        gratitude: existing.gratitude,
        affirmation: existing.affirmation,
        breathingCompleted: existing.breathingCompleted,
        bodyScanCompleted: existing.bodyScanCompleted,
        mindfulCheckinNotes: existing.mindfulCheckinNotes,
      });
      setCompletedSteps([0, 1, 2, 3, 4, 5, 6]);
    }
  }, []);

  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const nextStep = () => {
    markStepComplete(currentStep);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    const entry: MorningEntry = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      ...formData,
      createdAt: new Date().toISOString(),
    };
    
    saveMorningEntry(entry);
    toast({
      title: "Morning intentions saved! 🌅",
      description: "Have a wonderful, mindful day.",
    });
    navigate("/");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">How are you feeling this morning?</p>
            <MoodSelector value={formData.mood} onChange={(mood) => setFormData({ ...formData, mood })} />
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">How did you sleep last night?</p>
            <SleepSlider 
              value={formData.sleepHours} 
              onChange={(sleepHours) => setFormData({ ...formData, sleepHours })} 
            />
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">What emotions are present right now?</p>
            <FeelingsInput 
              value={formData.feelings} 
              onChange={(feelings) => setFormData({ ...formData, feelings })} 
            />
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">What's your main goal for today?</p>
            <Textarea
              value={formData.dailyGoal}
              onChange={(e) => setFormData({ ...formData, dailyGoal: e.target.value })}
              placeholder="Today I want to..."
              className="min-h-[120px] bg-card/50 resize-none"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.dailyGoal.length}/300
            </p>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <GratitudeInput 
              value={formData.gratitude} 
              onChange={(gratitude) => setFormData({ ...formData, gratitude })} 
            />
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">Write a positive affirmation or mantra for today</p>
            <Textarea
              value={formData.affirmation}
              onChange={(e) => setFormData({ ...formData, affirmation: e.target.value })}
              placeholder="I am..."
              className="min-h-[100px] bg-card/50 resize-none text-center text-lg font-serif"
              maxLength={200}
            />
            <div className="grid grid-cols-2 gap-2 text-sm">
              {["I am capable", "I am worthy", "I am at peace", "I choose joy"].map((aff) => (
                <Button
                  key={aff}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, affirmation: aff })}
                  className="text-xs"
                >
                  {aff}
                </Button>
              ))}
            </div>
          </div>
        );
      
      case 6:
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground text-center">
              Complete these grounding exercises to start your day mindfully
            </p>
            
            <BreathingExercise 
              completed={formData.breathingCompleted}
              onComplete={() => setFormData({ ...formData, breathingCompleted: true })}
            />
            
            <BodyScan 
              completed={formData.bodyScanCompleted}
              onComplete={() => setFormData({ ...formData, bodyScanCompleted: true })}
            />

            <div className="space-y-2">
              <p className="text-sm font-medium">Mindful Check-in (optional)</p>
              <Textarea
                value={formData.mindfulCheckinNotes}
                onChange={(e) => setFormData({ ...formData, mindfulCheckinNotes: e.target.value })}
                placeholder="What sensations do you notice in your body? Any thoughts arising?"
                className="min-h-[80px] bg-card/50 resize-none"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div 
        className="relative h-32 sm:h-40 md:h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroMorning})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="absolute inset-0 flex items-end p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 max-w-3xl mx-auto w-full">
            <div className="p-2 bg-card/80 backdrop-blur rounded-xl">
              <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-semibold text-foreground">
                Morning Intentions
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Start your day with purpose
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 max-w-3xl mx-auto">
        <ProgressIndicator 
          steps={steps} 
          currentStep={currentStep} 
          completedSteps={completedSteps} 
        />
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-3xl mx-auto">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {steps[currentStep]}
              {completedSteps.includes(currentStep) && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-20 sm:bottom-24 left-0 right-0 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 sm:gap-3 max-w-3xl mx-auto">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex-1 gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden xs:inline">Back</span>
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleSave} className="flex-1 gap-1 sm:gap-2 text-sm sm:text-base">
              <Check className="h-4 w-4" />
              Complete
            </Button>
          ) : (
            <Button onClick={nextStep} className="flex-1 gap-1 sm:gap-2 text-sm sm:text-base">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default MorningIntentions;
