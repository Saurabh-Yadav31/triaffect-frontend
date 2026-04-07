import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain } from "lucide-react";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center px-6 justify-between">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
        <Brain className="w-6 h-6" />
        TriAffect
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {currentUser ? (
          <>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link to="/detect">
              <Button variant="ghost" size="sm">Detect</Button>
            </Link>
            <Link to="/community">
              <Button variant="ghost" size="sm">Community</Button>
            </Link>
            <Avatar className="w-8 h-8 cursor-pointer" onClick={() => navigate("/profile")}>
              <AvatarImage src={currentUser.photoURL} />
              <AvatarFallback>
                {currentUser.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}