import { useEffect } from 'react'

import useGameStore from '../store/gameStore'
import { UIProvider } from './UIContext'

import Header from './Header'
import Logo from './Logo'
import Editor from './Editor'
import Canvas from './Canvas'
import Actions from './Actions'
import Notification from './Notification'

// Import Race UI Components
import { StartButton, RaceHUD, RaceResults } from './RaceUI'

export default function App() {
    // Get vehicle state from game store
    const loadVehicleFromUrl = useGameStore((state) => state.loadVehicleFromUrl)

    // Run once to load vehicle from URL if present
    useEffect(() => {
        loadVehicleFromUrl()
    }, [loadVehicleFromUrl])

    return (
        <UIProvider>
            <div className='App'>
                <Header />
                <Canvas />
                <Logo />
                <Editor />
                <Actions />
                <Notification />
                
                {/* Race UI Components */}
                <StartButton />
                <RaceHUD />
                <RaceResults />
            </div>
        </UIProvider>
    )
}