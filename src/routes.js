import { Navigate } from 'react-router-dom';
import ChatDrawer from './components/ChatDrawer';
import Chat from './components/Chat';
const routes = [
  {
    path: '/',
    element: <ChatDrawer />,
    children: [
      { path: 'chat/:username', element: <Chat /> },
      { path: "/", element: <div>Home </div>},
      { path: '404', element: <div>Not found</div> },
      { path: '*', element: <Navigate to="/404" /> }
    ]
  }
];

export default routes;
