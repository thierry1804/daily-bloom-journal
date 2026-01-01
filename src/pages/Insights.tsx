import { useMemo } from "react";
import { BarChart3, TrendingUp, Calendar, Heart, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { getJournalData } from "@/lib/storage";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";

const Insights = () => {
  const { morningEntries, eveningEntries } = getJournalData();

  const stats = useMemo(() => {
    const totalDays = morningEntries.length;
    const avgMorningMood = morningEntries.length 
      ? morningEntries.reduce((sum, e) => sum + e.mood, 0) / morningEntries.length 
      : 0;
    const avgSleep = morningEntries.length 
      ? morningEntries.reduce((sum, e) => sum + e.sleepHours, 0) / morningEntries.length 
      : 0;
    const avgDayRating = eveningEntries.length 
      ? eveningEntries.reduce((sum, e) => sum + e.dayRating, 0) / eveningEntries.length 
      : 0;

    return { totalDays, avgMorningMood, avgSleep, avgDayRating };
  }, [morningEntries, eveningEntries]);

  const moodChartData = useMemo(() => {
    return morningEntries.slice(-7).map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
      mood: entry.mood,
      sleep: entry.sleepHours,
    }));
  }, [morningEntries]);

  const dayRatingData = useMemo(() => {
    return eveningEntries.slice(-7).map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
      rating: entry.dayRating,
    }));
  }, [eveningEntries]);

  const chartConfig = {
    mood: { label: "Mood", color: "hsl(var(--chart-1))" },
    sleep: { label: "Sleep", color: "hsl(var(--chart-2))" },
    rating: { label: "Day Rating", color: "hsl(var(--chart-4))" },
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/20 rounded-xl">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-semibold text-foreground">
              Your Insights
            </h1>
            <p className="text-sm text-muted-foreground">
              Track your mindfulness journey
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 -mt-2 grid grid-cols-2 gap-4">
        <Card className="bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs text-muted-foreground">Total Days</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalDays}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Sun className="h-4 w-4" />
              <span className="text-xs text-muted-foreground">Avg Mood</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgMorningMood.toFixed(1)}/5</p>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Moon className="h-4 w-4" />
              <span className="text-xs text-muted-foreground">Avg Sleep</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgSleep.toFixed(1)}h</p>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Heart className="h-4 w-4" />
              <span className="text-xs text-muted-foreground">Avg Day</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgDayRating.toFixed(1)}/10</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="px-4 mt-6 space-y-6">
        {moodChartData.length > 0 ? (
          <>
            <Card className="bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Morning Mood (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-48">
                  <AreaChart data={moodChartData}>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis hide domain={[0, 5]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Moon className="h-4 w-4 text-primary" />
                  Sleep Hours (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-48">
                  <BarChart data={moodChartData}>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis hide domain={[0, 12]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="sleep"
                      fill="hsl(var(--chart-2))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="bg-card/80">
            <CardContent className="p-8 text-center">
              <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No Data Yet</h3>
              <p className="text-muted-foreground text-sm">
                Start your morning and evening routines to see your insights here.
              </p>
            </CardContent>
          </Card>
        )}

        {dayRatingData.length > 0 && (
          <Card className="bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Day Ratings (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-48">
                <AreaChart data={dayRatingData}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis hide domain={[0, 10]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="rating"
                    stroke="hsl(var(--chart-4))"
                    fill="hsl(var(--chart-4))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <Navigation />
    </div>
  );
};

export default Insights;
