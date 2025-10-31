import { Car } from 'lucide-react'
import useGameStore from '../store/gameStore'

function Logo() {
    const uiVisible = useGameStore((state) => state.uiVisible)
    
    return (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-300 ${uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="backdrop-blur-xl bg-black/60 border border-cyan-500/30 rounded-full px-8 py-3 shadow-2xl shadow-cyan-500/20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <Car className="text-black" size={20} />
                    </div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent tracking-wider">
                        MECHVERSE
                    </h1>
                </div>
            </div>
        </div>
    )
}

export default Logo