import React from 'react';
import IssueTracker from './components/IssueTracker';

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>Issue Tracking System</h1>
        <p>React frontend + Spring Boot backend + MongoDB</p>
      </header>
      <IssueTracker />
    </div>
  );
}

export default App;
