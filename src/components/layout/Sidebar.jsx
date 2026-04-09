import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Brain,
  FileEdit,
  Users,
  BookOpen,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { to: "/detect",    icon: Brain,      label: "Detect" },
  { to: "/history",   icon: FileEdit,   label: "Log" },
  { to: "/community", icon: Users,      label: "Community" },
  { to: "/profile",   icon: BookOpen,   label: "Articles" },
];

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-80 bg-[#FDF9F0] border-r border-[#E6E2D9] flex flex-col py-12 px-8 gap-20 z-[60]">
      {/* Sidebar Header / Logo */}
      <div className="px-4 pl-6">
        <h1 className="text-3xl font-bold text-[#6B7A5C]" style={{ fontFamily: "'Georgia', serif" }}>
          TriAffect
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-8">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-5 px-8 py-5 rounded-2xl text-xl font-semibold transition-all duration-200
              ${isActive
                ? "bg-[#E8E4D9] text-[#5A6B54]"
                : "text-[#9BA9A0] hover:text-[#6B7A5C]"
              }`
            }
            style={{ fontFamily: "'Calisto MT', 'Crimson Text', Georgia, serif" }}
          >
            <Icon className="w-7 h-7 stroke-[1.5]" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}