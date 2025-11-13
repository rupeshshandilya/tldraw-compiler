import { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'

type Language = 'javascript' | 'python' | 'java' | 'cpp'

const CodeEditor = () => {
  const [code, setCode] = useState<string>('// Write your code here\nconsole.log("Hello World!");')
  const [language, setLanguage] = useState<Language>('javascript')
  const [input, setInput] = useState<string>('') // User input for stdin
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState<boolean>(false)

  // Piston API configuration
  const PISTON_API = 'https://emkc.org/api/v2/piston'

  // Map language to Piston API language identifiers
  const languageMap: Record<Language, string> = {
    javascript: 'javascript',
    python: 'python',
    java: 'java',
    cpp: 'c++',
  }

  // Get file extensions for each language
  const getFileName = (lang: Language): string => {
    const fileNames: Record<Language, string> = {
      javascript: 'index.js',
      python: 'main.py',
      java: 'Main.java',
      cpp: 'main.cpp',
    }
    return fileNames[lang]
  }

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
    const templates: Record<Language, string> = {
      javascript: '// JavaScript Code\nconst readline = require(\'readline\');\nconst rl = readline.createInterface({\n  input: process.stdin,\n  output: process.stdout\n});\n\nrl.on(\'line\', (line) => {\n  console.log(`You entered: ${line}`);\n  rl.close();\n});',
      python: '# Python Code\nname = input("Enter your name: ")\nprint(f"Hello, {name}!")',
      java: '// Java Code\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.print("Enter your name: ");\n        String name = scanner.nextLine();\n        System.out.println("Hello, " + name + "!");\n        scanner.close();\n    }\n}',
      cpp: '// C++ Code\n#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    cout << "Enter your name: ";\n    getline(cin, name);\n    cout << "Hello, " << name << "!" << endl;\n    return 0;\n}',
    }
    return templates[lang]
  }

  // Get default input for each language
  const getDefaultInput = (lang: Language): string => {
    const inputs: Record<Language, string> = {
      javascript: 'World',
      python: 'Rupesh',
      java: 'Developer',
      cpp: 'Coder',
    }
    return inputs[lang]
  }

  // Handle language change
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang)
    setCode(getDefaultCode(newLang))
    setInput(getDefaultInput(newLang))
    setOutput('')
  }

  // Execute code using Piston API
  const executeWithPiston = async () => {
    try {
      setOutput('Executing...')

      const response = await fetch(`${PISTON_API}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: languageMap[language],
          version: '*',
          files: [
            {
              name: getFileName(language),
              content: code,
            },
          ],
          stdin: input, // Pass user input to stdin
          args: [],
          compile_timeout: 10000,
          run_timeout: 3000,
          compile_memory_limit: -1,
          run_memory_limit: -1,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      let outputText = ''
      
      if (result.compile && result.compile.stderr) {
        outputText += `Compilation Error:\n${result.compile.stderr}\n`
      }
      
      if (result.run) {
        if (result.run.stdout) {
          outputText += result.run.stdout
        }
        if (result.run.stderr) {
          outputText += result.run.stderr
        }
        if (result.run.code !== 0 && result.run.signal) {
          outputText += `\nProcess exited with code ${result.run.code}`
        }
      }

      setOutput(outputText || 'No output')
    } catch (error: any) {
      setOutput(`Error: ${error.message}`)
    }
  }

  // Execute JavaScript locally in browser
  const executeJavaScript = () => {
    try {
      const logs: string[] = []
      const originalLog = console.log
      
      console.log = (...args: any[]) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '))
        originalLog(...args)
      }

      eval(code)

      console.log = originalLog

      setOutput(logs.join('\n') || 'Code executed successfully (no output)')
    } catch (error: any) {
      setOutput(`Error: ${error.message}\n${error.stack || ''}`)
    }
  }

  // Main run function
  const runCode = async () => {
    setIsRunning(true)
    setOutput('Running...')

    try {
      if (language === 'javascript') {
        executeJavaScript()
      } else {
        await executeWithPiston()
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
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

        <div style={{
          marginLeft: 'auto',
          padding: '5px 10px',
          backgroundColor: '#0e639c',
          color: '#fff',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          Powered by Piston API
        </div>
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

        {/* Right Panel: Input + Output */}
        <div style={{ 
          width: '400px', 
          backgroundColor: '#1e1e1e',
          borderLeft: '1px solid #3c3c3c',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Input Section */}
          <div style={{ 
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            borderBottom: '1px solid #3c3c3c'
          }}>
            <div style={{ 
              padding: '10px 15px', 
              backgroundColor: '#252526',
              borderBottom: '1px solid #3c3c3c',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              Input (stdin)
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input for your program here..."
              style={{
                flex: 1,
                margin: 0,
                padding: '15px',
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
                fontSize: '13px',
                fontFamily: 'Consolas, Monaco, monospace',
                border: 'none',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          {/* Output Section */}
          <div style={{ 
            flex: 1,
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
    </div>
  )
}

export default CodeEditor
