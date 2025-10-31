import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TimeTableGenerator from './schedule.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <TimeTableGenerator />
  </StrictMode>,
)
