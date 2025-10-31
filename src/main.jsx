import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { TimeTableGenerator } from './Schedules.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <TimeTableGenerator />
  </StrictMode>,
)
