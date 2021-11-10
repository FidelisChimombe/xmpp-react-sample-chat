import logo from './logo.svg';
import { useEffect } from 'react';
import XMPP from './utils/xmpp';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadConnectedUsers } from './redux/slices/contacts/contactsSlice';
import routes from './routes';

function App() {
  const content = useRoutes(routes);
  useEffect(() => {
    XMPP.startService();
  },[]);
  return (
    <div className="App">
      <header className="App-header">
        { content }
      </header>
    </div>
  );
}
const AppWrapper = () => {
  const dispatch = useDispatch();
  useEffect(()=>{
    dispatch(loadConnectedUsers());
  },[]);

  return (
    <Router>
      <App/>
    </Router>
  )
}
export default AppWrapper;


