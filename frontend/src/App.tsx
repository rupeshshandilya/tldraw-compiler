import { useState } from 'react'
import './App.css'
import CodeEditor from './components/editor/CodeEditor'
import DrawingEditor from './components/drawing/DrawingEditor'

type View = 'drawing' | 'code'

function App() {
  const [currentView, setCurrentView] = useState<View>('code')

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Tab Switcher */}
      <div style={{ 
        display: 'flex', 
        backgroundColor: '#252526', 
        borderBottom: '1px solid #3c3c3c',
        padding: '0'
      }}>
        <button
          onClick={() => setCurrentView('code')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentView === 'code' ? '#1e1e1e' : 'transparent',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Code Editor
        </button>
        <button
          onClick={() => setCurrentView('drawing')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentView === 'drawing' ? '#1e1e1e' : 'transparent',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Drawing Board
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {currentView === 'code' ? <CodeEditor /> : <DrawingEditor />}
      </div>
    </div>
  )
}

export default App
