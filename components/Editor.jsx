import { useState } from 'react'
import { Car, Droplet, Settings, Disc, Circle, Wrench, Eye, EyeOff } from 'lucide-react'
import vehicleConfigs from '../vehicleConfigs'
import useGameStore from '../store/gameStore'

function Editor() {
    // Get vehicle state from store using granular selectors
    const body = useGameStore((state) => state.currentVehicle?.body) || null
    const color = useGameStore((state) => state.currentVehicle?.color)
    const roughness = useGameStore((state) => state.currentVehicle?.roughness) || 0
    const lift = useGameStore((state) => state.currentVehicle?.lift)
    const wheel_offset = useGameStore((state) => state.currentVehicle?.wheel_offset) || 0
    const rim = useGameStore((state) => state.currentVehicle?.rim)
    const rim_color = useGameStore((state) => state.currentVehicle?.rim_color)
    const rim_color_secondary = useGameStore((state) => state.currentVehicle?.rim_color_secondary)
    const rim_diameter = useGameStore((state) => state.currentVehicle?.rim_diameter)
    const rim_width = useGameStore((state) => state.currentVehicle?.rim_width)
    const tire = useGameStore((state) => state.currentVehicle?.tire)
    const tire_diameter = useGameStore((state) => state.currentVehicle?.tire_diameter)
    const addons = useGameStore((state) => state.currentVehicle?.addons) || {}

    const setVehicle = useGameStore((state) => state.setVehicle)
    const physicsEnabled = useGameStore((state) => state.physicsEnabled)
    const setPhysicsEnabled = useGameStore((state) => state.setPhysicsEnabled)
    const cameraAutoRotate = useGameStore((state) => state.cameraAutoRotate)
    const setCameraAutoRotate = useGameStore((state) => state.setCameraAutoRotate)

    // UI visibility state
    const [uiVisible, setUiVisible] = useState(true)

    // Reconstruct currentVehicle for existing code
    const currentVehicle = {
        body,
        color,
        roughness,
        lift,
        wheel_offset,
        rim,
        rim_color,
        rim_color_secondary,
        rim_diameter,
        rim_width,
        tire,
        tire_diameter,
        addons,
    }

    const [activeSection, setActiveSection] = useState('vehicle')

    // Check if current vehicle has addons
    function addonsExist() {
        return currentVehicle.body && Object.keys(vehicleConfigs.vehicles[currentVehicle.body].addons).length > 0
    }

    // Group object by key
    const groupObjectByKey = (object, key) => {
        const groups = {}
        for (const id of Object.keys(object)) {
            const type = object[id][key]
            if (!groups[type]) groups[type] = []
            groups[type].push(id)
        }
        return groups
    }

    // Select list grouped by provided type
    const GroupedSelect = ({ value, itemList, groupBy, ...restProps }) => {
        const groupedList = groupObjectByKey(itemList, groupBy)
        return (
            <select 
                value={value || ''} 
                {...restProps}
                className="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                {Object.keys(groupedList).map((type) => (
                    <optgroup key={type} label={type}>
                        {groupedList[type].map((id) => (
                            <option key={id} value={id}>
                                {itemList[id].name}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>
        )
    }

    // Select list of different ranges in inches
    const InchRangeSelect = ({ value, min, max, ...restProps }) => {
        let elements = []
        for (let i = min; i <= max; i++) {
            elements.push(
                <option key={i} value={i}>
                    {i}"
                </option>
            )
        }
        return (
            <select 
                value={value || 0} 
                {...restProps}
                className="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 text-sm focus:border-cyan-400 focus:outline-none">
                {elements}
            </select>
        )
    }

    const ControlPanel = ({ children, className = '' }) => (
        <div className={`fixed backdrop-blur-xl bg-black/40 border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/20 ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-lg" />
            <div className="relative">{children}</div>
        </div>
    )

    const SectionButton = ({ icon: Icon, label, section, active }) => (
        <button
            onClick={() => setActiveSection(section)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                active
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/30'
                    : 'text-gray-400 hover:text-cyan-300 hover:bg-white/5'
            }`}>
            <Icon size={18} />
            <span className="text-sm font-semibold tracking-wide">{label}</span>
        </button>
    )

    return (
        <>
            {/* UI Toggle Button - Always visible in top-right */}
            <button
                onClick={() => setUiVisible(!uiVisible)}
                className="fixed top-6 right-6 z-[60] w-12 h-12 backdrop-blur-xl bg-black/60 border border-cyan-500/30 rounded-full shadow-2xl shadow-cyan-500/20 flex items-center justify-center text-cyan-300 hover:bg-cyan-500/20 transition-all duration-300"
                title={uiVisible ? "Hide UI (Full Screen)" : "Show UI"}>
                {uiVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>

            {/* All UI Elements - Hidden when uiVisible is false */}
            <div className={`transition-opacity duration-300 ${uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Left Side - Navigation */}
                <ControlPanel className="top-32 left-6 z-40 p-2">
                    <div className="flex flex-col gap-1">
                        <SectionButton icon={Car} label="VEHICLE" section="vehicle" active={activeSection === 'vehicle'} />
                        <SectionButton icon={Droplet} label="PAINT" section="paint" active={activeSection === 'paint'} />
                        <SectionButton icon={Settings} label="SUSPENSION" section="suspension" active={activeSection === 'suspension'} />
                        <SectionButton icon={Disc} label="RIMS" section="rims" active={activeSection === 'rims'} />
                        <SectionButton icon={Circle} label="TIRES" section="tires" active={activeSection === 'tires'} />
                        {addonsExist() && <SectionButton icon={Wrench} label="ADDONS" section="addons" active={activeSection === 'addons'} />}
                    </div>
                </ControlPanel>

                {/* Right Side - Active Section Controls */}
                <ControlPanel className="top-32 right-6 z-40 p-6 w-80 max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-cyan-300 tracking-wider border-b border-cyan-500/30 pb-2">
                            {activeSection.toUpperCase()}
                        </h2>

                        {activeSection === 'vehicle' && (
                            <div className="space-y-3">
                                <label className="block text-xs text-gray-400 uppercase tracking-wider">Model</label>
                                <GroupedSelect 
                                    value={currentVehicle.body} 
                                    itemList={vehicleConfigs.vehicles} 
                                    groupBy="make"
                                    onChange={(e) => setVehicle({ body: e.target.value })}
                                />
                            </div>
                        )}

                        {activeSection === 'paint' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-xs text-gray-400 uppercase tracking-wider">Color</label>
                                    <div className="flex gap-2 items-center">
                                        <input 
                                            type="color" 
                                            value={currentVehicle.color || '#000000'} 
                                            onChange={(e) => setVehicle({ color: e.target.value })}
                                            className="w-16 h-10 rounded-lg border-2 border-cyan-500/30 cursor-pointer"
                                        />
                                        <span className="text-cyan-100 text-sm font-mono">{currentVehicle.color}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs text-gray-400 uppercase tracking-wider">Finish</label>
                                    <select 
                                        value={currentVehicle.roughness || 0} 
                                        onChange={(e) => setVehicle({ roughness: e.target.value })}
                                        className="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 text-sm focus:border-cyan-400 focus:outline-none">
                                        <option value="0.6">Matte</option>
                                        <option value="0.2">Semi Gloss</option>
                                        <option value="0">High Gloss</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeSection === 'suspension' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-xs text-gray-400 uppercase tracking-wider">Lift</label>
                                    <InchRangeSelect 
                                        value={currentVehicle.lift} 
                                        min={-2} 
                                        max={8} 
                                        onChange={(e) => setVehicle({ lift: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs text-gray-400 uppercase tracking-wider">
                                        Offset: {(currentVehicle.wheel_offset * 100).toFixed(0)}%
                                    </label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="0.1" 
                                        step="0.01" 
                                        value={currentVehicle.wheel_offset || 0}
                                        onChange={(e) => setVehicle({ wheel_offset: e.target.value })}
                                        className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-cyan-400 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-cyan-500/50"
                                    />
                                </div>
                            </div>
                        )}

                        {activeSection === 'rims' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-xs text-gray-400 uppercase tracking-wider">Type</label>
                                    <GroupedSelect 
                                        value={currentVehicle.rim} 
                                        itemList={vehicleConfigs.wheels.rims} 
                                        groupBy="make"
                                        onChange={(e) => setVehicle({ rim: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="block text-xs text-gray-400 uppercase tracking-wider">Color</label>
                                        <select 
                                            value={currentVehicle.rim_color || ''} 
                                            onChange={(e) => setVehicle({ rim_color: e.target.value })}
                                            className="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-2 py-2 text-cyan-100 text-xs focus:border-cyan-400 focus:outline-none">
                                            <option value="flat_black">Flat Black</option>
                                            <option value="gloss_black">Gloss Black</option>
                                            <option value="silver">Silver</option>
                                            <option value="chrome">Chrome</option>
                                            <option value="body">Body Match</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs text-gray-400 uppercase tracking-wider">Accent</label>
                                        <select 
                                            value={currentVehicle.rim_color_secondary || ''} 
                                            onChange={(e) => setVehicle({ rim_color_secondary: e.target.value })}
                                            className="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-2 py-2 text-cyan-100 text-xs focus:border-cyan-400 focus:outline-none">
                                            <option value="flat_black">Flat Black</option>
                                            <option value="gloss_black">Gloss Black</option>
                                            <option value="silver">Silver</option>
                                            <option value="chrome">Chrome</option>
                                            <option value="body">Body Match</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="block text-xs text-gray-400 uppercase tracking-wider">Diameter</label>
                                        <InchRangeSelect 
                                            value={currentVehicle.rim_diameter} 
                                            min={14} 
                                            max={24} 
                                            onChange={(e) => setVehicle({ rim_diameter: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs text-gray-400 uppercase tracking-wider">Width</label>
                                        <InchRangeSelect 
                                            value={currentVehicle.rim_width} 
                                            min={8} 
                                            max={16} 
                                            onChange={(e) => setVehicle({ rim_width: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'tires' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-xs text-gray-400 uppercase tracking-wider">Type</label>
                                    <GroupedSelect 
                                        value={currentVehicle.tire} 
                                        itemList={vehicleConfigs.wheels.tires} 
                                        groupBy="make"
                                        onChange={(e) => setVehicle({ tire: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs text-gray-400 uppercase tracking-wider">Size</label>
                                    <InchRangeSelect 
                                        value={currentVehicle.tire_diameter} 
                                        min={30} 
                                        max={40} 
                                        onChange={(e) => setVehicle({ tire_diameter: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {activeSection === 'addons' && addonsExist() && (
                            <div className="space-y-4">
                                {Object.keys(vehicleConfigs.vehicles[currentVehicle.body].addons).map((addon) => (
                                    <div key={addon} className="space-y-2">
                                        <label className="block text-xs text-gray-400 uppercase tracking-wider">
                                            {vehicleConfigs.vehicles[currentVehicle.body].addons[addon].name}
                                        </label>
                                        <select 
                                            value={currentVehicle.addons[addon] || ''} 
                                            onChange={(e) => setVehicle({ addons: { ...currentVehicle.addons, [addon]: e.target.value } })}
                                            className="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 text-sm focus:border-cyan-400 focus:outline-none">
                                            {!vehicleConfigs.vehicles[currentVehicle.body].addons[addon].required && 
                                                <option value="">None</option>
                                            }
                                            {Object.keys(vehicleConfigs.vehicles[currentVehicle.body].addons[addon].options).map((option) => (
                                                <option key={option} value={option}>
                                                    {vehicleConfigs.vehicles[currentVehicle.body].addons[addon].options[option].name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </ControlPanel>

                {/* Bottom Left - Options */}
                <ControlPanel className="bottom-6 left-6 z-40 p-4">
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-12 h-6 rounded-full transition-all ${cameraAutoRotate ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-gray-700'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${cameraAutoRotate ? 'translate-x-6' : ''} shadow-lg`} />
                            </div>
                            <span className="text-sm text-gray-300 group-hover:text-cyan-300 transition-colors">Auto Rotate</span>
                            <input 
                                type="checkbox" 
                                checked={cameraAutoRotate} 
                                onChange={(e) => setCameraAutoRotate(e.target.checked)}
                                className="sr-only"
                            />
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-12 h-6 rounded-full transition-all ${physicsEnabled ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-gray-700'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${physicsEnabled ? 'translate-x-6' : ''} shadow-lg`} />
                            </div>
                            <span className="text-sm text-gray-300 group-hover:text-cyan-300 transition-colors">Physics</span>
                            <input 
                                type="checkbox" 
                                checked={physicsEnabled} 
                                onChange={(e) => setPhysicsEnabled(e.target.checked)}
                                className="sr-only"
                            />
                        </label>
                    </div>
                </ControlPanel>
            </div>
        </>
    )
}

export default Editor