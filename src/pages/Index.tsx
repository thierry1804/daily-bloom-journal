import { Link } from "react-router-dom";
import { Sun, Moon, Sparkles, Heart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { getTodaysMorningEntry, getTodaysEveningEntry } from "@/lib/storage";
import heroMorning from "@/assets/hero-morning.jpg";

const Index = () => {
  const morningDone = !!getTodaysMorningEntry();
  const eveningDone = !!getTodaysEveningEntry();
  
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  
  const formattedDate = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <div 
        className="relative h-48 sm:h-56 md:h-64 lg:h-72 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroMorning})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto w-full">
            <p className="text-sm font-medium text-primary-foreground/80">{formattedDate}</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-semibold text-primary-foreground">
              {greeting}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 -mt-8 space-y-6 max-w-3xl mx-auto">
        {/* Daily Quote */}
        <Card className="bg-card/80 backdrop-blur border-primary/20 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="text-foreground italic font-serif text-lg">
                  "The present moment is the only moment available to us, and it is the door to all moments."
                </p>
                <p className="text-muted-foreground text-sm mt-2">— Thich Nhat Hanh</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Routines */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Today's Journal
          </h2>

          <Link to="/morning" className="block">
            <Card className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              morningDone ? "bg-primary/10 border-primary/30" : "bg-card hover:bg-accent/50"
            }`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${morningDone ? "bg-primary/20" : "bg-accent"}`}>
                      <Sun className={`h-6 w-6 ${morningDone ? "text-primary" : "text-accent-foreground"}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Morning Intentions</h3>
                      <p className="text-sm text-muted-foreground">
                        {morningDone ? "Completed ✓" : "Set your intentions for the day"}
                      </p>
                    </div>
                  </div>
                  {!morningDone && (
                    <Button variant="ghost" size="sm" className="text-primary">
                      Start
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/evening" className="block">
            <Card className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              eveningDone ? "bg-primary/10 border-primary/30" : "bg-card hover:bg-accent/50"
            }`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${eveningDone ? "bg-primary/20" : "bg-accent"}`}>
                      <Moon className={`h-6 w-6 ${eveningDone ? "text-primary" : "text-accent-foreground"}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Evening Reflection</h3>
                      <p className="text-sm text-muted-foreground">
                        {eveningDone ? "Completed ✓" : "Reflect on your day"}
                      </p>
                    </div>
                  </div>
                  {!eveningDone && (
                    <Button variant="ghost" size="sm" className="text-primary">
                      Start
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Streak / Progress */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent border-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily Progress</p>
                <p className="font-semibold text-foreground">
                  {morningDone && eveningDone 
                    ? "You've completed both routines today! 🎉" 
                    : morningDone 
                    ? "Morning done! Complete your evening reflection later."
                    : "Start your mindful journey today"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};

export default Index;
