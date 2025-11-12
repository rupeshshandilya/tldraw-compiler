import express from 'express'
import cors from 'cors'
import { exec } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)
const app = express()

app.use(cors())
app.use(express.json())

const PORT = 3001

// Execute code endpoint
app.post('/execute', async (req, res) => {
  const { code, language } = req.body

  try {
    let output = ''

    switch (language) {
      case 'python':
        output = await executePython(code)
        break
      case 'java':
        output = await executeJava(code)
        break
      case 'cpp':
        output = await executeCpp(code)
        break
      default:
        return res.status(400).json({ error: 'Unsupported language' })
    }

    res.json({ output })
  } catch (error: any) {
    res.json({ error: error.message })
  }
})

// Execute Python code
async function executePython(code: string): Promise<string> {
  const filename = `temp_${Date.now()}.py`
  const filepath = path.join(__dirname, filename)

  try {
    writeFileSync(filepath, code)
    const { stdout, stderr } = await execAsync(`python3 ${filepath}`, {
      timeout: 5000,
    })
    return stdout || stderr
  } finally {
    try {
      unlinkSync(filepath)
    } catch (e) {}
  }
}

// Extract public class name from Java code
function extractJavaClassName(code: string): string {
  // Match: public class ClassName
  const match = code.match(/public\s+class\s+(\w+)/);
  if (match) {
    return match[1]
  }
  
  // If no public class, try to find any class
  const anyClassMatch = code.match(/class\s+(\w+)/);
  if (anyClassMatch) {
    return anyClassMatch[1]
  }
  
  // Default to Main
  return 'Main'
}

// Execute Java code
async function executeJava(code: string): Promise<string> {
  // Extract the class name from the code
  const className = extractJavaClassName(code)
  const filename = `${className}.java`
  const filepath = path.join(__dirname, filename)

  try {
    writeFileSync(filepath, code)
    
    // Compile
    await execAsync(`javac ${filepath}`, {
      timeout: 10000,
    })
    
    // Run
    const { stdout, stderr } = await execAsync(`java -cp ${__dirname} ${className}`, {
      timeout: 5000,
    })
    
    return stdout || stderr
  } finally {
    try {
      unlinkSync(filepath)
      unlinkSync(path.join(__dirname, `${className}.class`))
    } catch (e) {}
  }
}

// Execute C++ code with C++17 support
async function executeCpp(code: string): Promise<string> {
  const filename = `temp_${Date.now()}.cpp`
  const filepath = path.join(__dirname, filename)
  const outputFile = filepath.replace('.cpp', '')

  try {
    writeFileSync(filepath, code)
    
    // Compile with C++17 standard
    await execAsync(`g++ -std=c++17 -Wall ${filepath} -o ${outputFile}`, {
      timeout: 10000,
    })
    
    // Run
    const { stdout, stderr } = await execAsync(outputFile, {
      timeout: 5000,
    })
    
    return stdout || stderr
  } finally {
    try {
      unlinkSync(filepath)
      unlinkSync(outputFile)
    } catch (e) {}
  }
}

app.listen(PORT, () => {
  console.log(`Code execution server running on http://localhost:${PORT}`)
})
