import Sidebar from './components/layout/Sidebar';
import MainWorkspace from './components/layout/MainWorkspace';
import InsightPanel from './components/layout/InsightPanel';
import ThreatCenter from './components/views/ThreatCenter';
import PromptLogs from './components/views/PromptLogs';
import Analytics from './components/views/Analytics';
import Documentation from './components/views/Documentation';
import Settings from './components/views/Settings';
import Auth from './components/views/Auth';
import Admin from './components/views/Admin';
import { useStore } from './store/useStore';
import { useEffect } from 'react';

function App() {
  const { activeTab, currentUser, loadHistory } = useStore();

  useEffect(() => {
    if (currentUser) {
      loadHistory();
    }
  }, [currentUser]);

  if (!currentUser) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Chat':
        return (
          <>
            <MainWorkspace />
            <InsightPanel />
          </>
        );
      case 'Threat Center':
        return <ThreatCenter />;
      case 'Prompt Logs':
        return <PromptLogs />;
      case 'Analytics':
        return <Analytics />;
      case 'Documentation':
        return <Documentation />;
      case 'Settings':
        return <Settings />;
      case 'Admin':
        return <Admin />;
      default:
        return (
          <>
            <MainWorkspace />
            <InsightPanel />
          </>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-sentinel-black overflow-hidden font-sans text-white">
      <Sidebar />
      {renderContent()}
    </div>
  );
}

export default App;
