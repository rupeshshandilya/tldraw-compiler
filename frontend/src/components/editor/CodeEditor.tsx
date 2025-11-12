import { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { oneDark } from '@codemirror/theme-one-dark'

type Language = 'javascript' | 'python' | 'java' | 'cpp'

const CodeEditor = () => {
  const [code, setCode] = useState<string>('// Write your code here\nconsole.log("Hello World!");')
  const [language, setLanguage] = useState<Language>('javascript')
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState<boolean>(false)

  // Get language extension for CodeMirror
  const getLanguageExtension = () => {
    switch (language) {
      case 'javascript':
        return javascript({ jsx: true })
      case 'python':
        return python()
      case 'java':
        return java()
      case 'cpp':
        return cpp()
      default:
        return javascript()
    }
  }

  // Get default code template for each language
  const getDefaultCode = (lang: Language): string => {
    const templates = {
      javascript: '// JavaScript Code\nconsole.log("Hello World!");',
      python: '# Python Code\nprint("Hello World!")',
      java: '// Java Code\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}',
      cpp: '// C++ Code\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World!" << endl;\n    return 0;\n}',
    }
    return templates[lang]
  }

  // Handle language change
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang)
    setCode(getDefaultCode(newLang))
    setOutput('')
  }

  // Execute JavaScript code locally in browser
  const executeJavaScript = () => {
    try {
      // Capture console.log output
      const logs: string[] = []
      const originalLog = console.log
      console.log = (...args: any[]) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '))
        originalLog(...args)
      }

      // Execute code
      eval(code)

      // Restore console.log
      console.log = originalLog

      setOutput(logs.join('\n') || 'Code executed successfully (no output)')
    } catch (error: any) {
      setOutput(`Error: ${error.message}`)
    }
  }

  // For compiled languages, you'll need a backend
  const executeCompiledLanguage = async () => {
    try {
      setOutput('Executing...')
      const response = await fetch('http://localhost:3001/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      })
      const data = await response.json()
      setOutput(data.output || data.error || 'No output')
    } catch (error: any) {
      setOutput(`Error: ${error.message}`)
    }
  }

  // Main run function
  const runCode = async () => {
    setIsRunning(true)
    setOutput('Running...')

    if (language === 'javascript') {
      executeJavaScript()
    } else {
      await executeCompiledLanguage()
    }

    setIsRunning(false)
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      backgroundColor: '#1e1e1e'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '10px 20px', 
        backgroundColor: '#252526',
        borderBottom: '1px solid #3c3c3c',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>Code Editor</h2>
        
        {/* Language Selector */}
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value as Language)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#3c3c3c',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>

        {/* Run Button */}
        <button
          onClick={runCode}
          disabled={isRunning}
          style={{
            padding: '8px 20px',
            backgroundColor: isRunning ? '#555' : '#0e639c',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isRunning ? 'Running...' : '▶ Run'}
        </button>
      </div>

      {/* Editor Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Code Editor */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <CodeMirror
            value={code}
            height="100%"
            theme={vscodeDark}
            extensions={[getLanguageExtension()]}
            onChange={(value) => setCode(value)}
            style={{ fontSize: '14px' }}
          />
        </div>

        {/* Output Panel */}
        <div style={{ 
          width: '400px', 
          backgroundColor: '#1e1e1e',
          borderLeft: '1px solid #3c3c3c',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            padding: '10px 15px', 
            backgroundColor: '#252526',
            borderBottom: '1px solid #3c3c3c',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            Output
          </div>
          <pre style={{ 
            flex: 1,
            margin: 0,
            padding: '15px',
            color: '#d4d4d4',
            fontSize: '13px',
            fontFamily: 'Consolas, Monaco, monospace',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}>
            {output || 'Run code to see output...'}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default CodeEditor
