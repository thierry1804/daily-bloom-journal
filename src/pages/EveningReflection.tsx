import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Moon, Check, Sparkles, BookOpen, Lightbulb, Sunrise } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { MoodSelector } from "@/components/MoodSelector";
import { DayRating } from "@/components/DayRating";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { saveEveningEntry, getTodaysEveningEntry, generateId, type EveningEntry } from "@/lib/storage";
import heroEvening from "@/assets/hero-evening.jpg";
import { toast } from "@/hooks/use-toast";

const steps = ["Day Rating", "End Mood", "Joys", "Learnings", "Tomorrow", "Final Thoughts"];

const EveningReflection = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const [formData, setFormData] = useState<Omit<EveningEntry, 'id' | 'date' | 'createdAt'>>({
    dayRating: 5,
    endMood: 3,
    joys: "",
    learnings: "",
    tomorrowAnticipation: "",
    finalThoughts: "",
  });

  useEffect(() => {
    const existing = getTodaysEveningEntry();
    if (existing) {
      setFormData({
        dayRating: existing.dayRating,
        endMood: existing.endMood,
        joys: existing.joys,
        learnings: existing.learnings,
        tomorrowAnticipation: existing.tomorrowAnticipation,
        finalThoughts: existing.finalThoughts,
      });
      setCompletedSteps([0, 1, 2, 3, 4, 5]);
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
    const entry: EveningEntry = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      ...formData,
      createdAt: new Date().toISOString(),
    };
    
    saveEveningEntry(entry);
    toast({
      title: "Evening reflection saved! 🌙",
      description: "Rest well and dream peacefully.",
    });
    navigate("/");
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 2: return <Sparkles className="h-5 w-5 text-primary" />;
      case 3: return <Lightbulb className="h-5 w-5 text-primary" />;
      case 4: return <Sunrise className="h-5 w-5 text-primary" />;
      case 5: return <BookOpen className="h-5 w-5 text-primary" />;
      default: return null;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">How would you rate your day overall?</p>
            <DayRating 
              value={formData.dayRating} 
              onChange={(dayRating) => setFormData({ ...formData, dayRating })} 
            />
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">How are you feeling right now?</p>
            <MoodSelector 
              value={formData.endMood} 
              onChange={(endMood) => setFormData({ ...formData, endMood })} 
            />
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <p className="text-muted-foreground">What brought you joy today?</p>
            </div>
            <Textarea
              value={formData.joys}
              onChange={(e) => setFormData({ ...formData, joys: e.target.value })}
              placeholder="Today I felt happy when..."
              className="min-h-[150px] bg-card/50 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.joys.length}/500
            </p>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Lightbulb className="h-5 w-5" />
              <p className="text-muted-foreground">What did you learn today?</p>
            </div>
            <Textarea
              value={formData.learnings}
              onChange={(e) => setFormData({ ...formData, learnings: e.target.value })}
              placeholder="Today I learned that..."
              className="min-h-[150px] bg-card/50 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.learnings.length}/500
            </p>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Sunrise className="h-5 w-5" />
              <p className="text-muted-foreground">What are you looking forward to tomorrow?</p>
            </div>
            <Textarea
              value={formData.tomorrowAnticipation}
              onChange={(e) => setFormData({ ...formData, tomorrowAnticipation: e.target.value })}
              placeholder="Tomorrow I'm excited about..."
              className="min-h-[150px] bg-card/50 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.tomorrowAnticipation.length}/500
            </p>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <BookOpen className="h-5 w-5" />
              <p className="text-muted-foreground">Any final thoughts before bed?</p>
            </div>
            <Textarea
              value={formData.finalThoughts}
              onChange={(e) => setFormData({ ...formData, finalThoughts: e.target.value })}
              placeholder="As I close this day, I want to remember..."
              className="min-h-[180px] bg-card/50 resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.finalThoughts.length}/1000
            </p>
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
        className="relative h-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroEvening})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="absolute inset-0 flex items-end p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-card/80 backdrop-blur rounded-xl">
              <Moon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-semibold text-foreground">
                Evening Reflection
              </h1>
              <p className="text-sm text-muted-foreground">
                Close your day with gratitude
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 pt-4">
        <ProgressIndicator 
          steps={steps} 
          currentStep={currentStep} 
          completedSteps={completedSteps} 
        />
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {getStepIcon(currentStep)}
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
      <div className="fixed bottom-20 left-0 right-0 px-4">
        <div className="flex gap-3 max-w-lg mx-auto">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex-1 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleSave} className="flex-1 gap-2">
              <Check className="h-4 w-4" />
              Complete
            </Button>
          ) : (
            <Button onClick={nextStep} className="flex-1 gap-2">
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

export default EveningReflection;
