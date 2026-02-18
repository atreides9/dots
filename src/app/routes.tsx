import { createBrowserRouter } from "react-router";
import { HomeFeed } from "./components/screens/home-feed";
import { ReaderView } from "./components/screens/reader-view";
import { MyLibrary } from "./components/screens/my-library";
import { Profile } from "./components/screens/profile";
import { Connections } from "./components/screens/connections";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomeFeed,
  },
  {
    path: "/read/:articleId",
    Component: ReaderView,
  },
  {
    path: "/library",
    Component: MyLibrary,
  },
  {
    path: "/profile/:userId?",
    Component: Profile,
  },
  {
    path: "/connections",
    Component: Connections,
  },
]);
