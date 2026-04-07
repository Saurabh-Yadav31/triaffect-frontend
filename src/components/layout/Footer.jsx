import { Brain } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border py-6 px-6 flex items-center justify-between text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4" />
        <span>TriAffect &copy; {new Date().getFullYear()}</span>
      </div>
      <p>Tri-Modal Emotion Recognition</p>
    </footer>
  );
}