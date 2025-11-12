import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

function DrawingEditor() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        persistenceKey="my-drawing-app"
        inferDarkMode
      />
    </div>
  )
}

export default DrawingEditor
