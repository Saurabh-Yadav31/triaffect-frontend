import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

import Home      from "@/pages/Home";
import Login     from "@/pages/Login";
import Register  from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Detect    from "@/pages/Detect";
import History   from "@/pages/History";
import Community from "@/pages/Community";
import Profile   from "@/pages/Profile";
import NotFound  from "@/pages/NotFound";

function AppLayout({ children, showSidebar }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}>
      <Navbar />
      <div style={{ display: "flex", paddingTop: "64px" }}>
        {showSidebar && <Sidebar />}
        <main style={{
          flex: 1,
          marginLeft: showSidebar ? "288px" : "0px",
          minHeight: "calc(100vh - 64px)",
          transition: "margin-left 200ms ease",
          width: "100%",
          boxSizing: "border-box"
        }}>
          {children}
        </main>
      </div>
      {!showSidebar && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<AppLayout showSidebar={false}><Home /></AppLayout>} />
        <Route path="/login" element={<AppLayout showSidebar={false}><Login /></AppLayout>} />
        <Route path="/register" element={<AppLayout showSidebar={false}><Register /></AppLayout>} />

        {/* Protected routes with Sidebar */}
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout showSidebar={true}><Dashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/detect"    element={<ProtectedRoute><AppLayout showSidebar={true}><Detect /></AppLayout></ProtectedRoute>} />
        <Route path="/history"   element={<ProtectedRoute><AppLayout showSidebar={true}><History /></AppLayout></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><AppLayout showSidebar={true}><Community /></AppLayout></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><AppLayout showSidebar={true}><Profile /></AppLayout></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<AppLayout showSidebar={false}><NotFound /></AppLayout>} />
      </Routes>
    </BrowserRouter>
  );
}