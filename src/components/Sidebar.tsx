import { useState } from "react";
import { 
  LayoutDashboard, 
  MessageCircle, 
  Activity, 
  Settings, 
  LogOut,
  Heart,
  Users,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRefreshChat?: () => void;
}

const Sidebar = ({ activeTab, onTabChange, onRefreshChat }: SidebarProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefreshChat) {
      setIsRefreshing(true);
      await onRefreshChat();
      setIsRefreshing(false);
    }
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "chat",
  label: "Chat with Innervoice",
      icon: MessageCircle,
    },
    {
      id: "mood-tracker",
      label: "Mood Tracker",
      icon: Activity,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
      {
        id: "peer-support",
        label: "Peer Support",
        icon: Users,
      },
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white">
            <img src="/logo.jpg" alt="InnerVoice Logo" className="w-10 h-10 object-cover" />
          </div>
          <div>
            <h1 className="font-semibold text-lg text-foreground">Innervoice</h1>
            <p className="text-sm text-muted-foreground">Mental Wellness</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full justify-start gap-3 h-10 px-3",
                    activeTab === item.id && "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full justify-start gap-3">
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;