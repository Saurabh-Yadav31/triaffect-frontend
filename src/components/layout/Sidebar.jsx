import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Scan,
  History,
  Users,
  UserCircle,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/detect",    icon: Scan,            label: "Detect" },
  { to: "/history",   icon: History,         label: "History" },
  { to: "/community", icon: Users,           label: "Community" },
  { to: "/profile",   icon: UserCircle,      label: "Profile" },
];

export default function Sidebar() {
  return (
    <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-56 bg-background border-r border-border flex flex-col py-6 px-3 gap-1">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`
          }
        >
          <Icon className="w-4 h-4" />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
