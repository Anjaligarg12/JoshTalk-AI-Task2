import { useState } from 'react';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { UserAnalysis } from './pages/UserAnalysis';
import { DetectionRules } from './pages/DetectionRules';
import { Analytics } from './pages/Analytics';
import { Recommendations } from './pages/Recommendations';
import { QualityScoreEngine } from './pages/QualityScoreEngine';
import './App.css';

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard />
        );
      case 'user-analysis':
        return (
          <UserAnalysis
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
          />
        );
      case 'score-engine':
        return <QualityScoreEngine />;
      case 'detection-rules':
        return <DetectionRules />;
      case 'analytics':
        return <Analytics />;
      case 'recommendations':
        return <Recommendations />;
      default:
        return (
          <Dashboard />
        );
    }
  };

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      onSelectUser={handleSelectUser}
    >
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

export default App;
