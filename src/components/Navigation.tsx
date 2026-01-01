import { Link, useLocation } from "react-router-dom";
import { Home, Sun, Moon, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/morning", icon: Sun, label: "Morning" },
  { path: "/evening", icon: Moon, label: "Evening" },
  { path: "/insights", icon: BarChart3, label: "Insights" },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center py-2 sm:py-3 px-2 sm:px-4 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-200 min-w-[60px] sm:min-w-[72px]",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", isActive && "animate-pulse")} />
              <span className="text-[10px] sm:text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
