import { createBrowserRouter } from "react-router-dom"

import Home      from "../pages/Home"
import Login     from "../pages/Login"
import Register  from "../pages/Register"
import Dashboard from "../pages/Dashboard"
import Detect    from "../pages/Detect"
import History   from "../pages/History"
import Community from "../pages/Community"
import Profile   from "../pages/Profile"
import NotFound  from "../pages/NotFound"

const router = createBrowserRouter([
  { path: "/",         element: <Home /> },
  { path: "/login",    element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/detect",   element: <Detect /> },
  { path: "/history",  element: <History /> },
  { path: "/community", element: <Community /> },
  { path: "/profile",  element: <Profile /> },
  { path: "*",         element: <NotFound /> },
])

export default router