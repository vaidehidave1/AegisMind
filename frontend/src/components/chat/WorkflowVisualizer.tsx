import { Shield, BrainCircuit, Search, CheckCircle, Code } from 'lucide-react';

const steps = [
  { id: 'safety', label: 'Safety Check', icon: Shield },
  { id: 'intent', label: 'Intent Detection', icon: Search },
  { id: 'reasoning', label: 'AI Reasoning', icon: BrainCircuit },
  { id: 'formatting', label: 'JSON Formatting', icon: Code },
  { id: 'complete', label: 'Response Ready', icon: CheckCircle },
];

interface Props {
  activeStep: string | null;
  isVisible: boolean;
}

export default function WorkflowVisualizer({ activeStep, isVisible }: Props) {
  if (!isVisible) return null;

  const activeIndex = steps.findIndex(s => s.id === activeStep);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="glass-panel px-8 py-6 rounded-2xl flex items-center gap-4">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isPast = index < activeIndex;
          
          return (
            <div key={step.id} className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  isActive 
                    ? 'bg-sentinel-cyan/20 border-sentinel-cyan text-sentinel-cyan shadow-[0_0_15px_rgba(0,240,255,0.4)] animate-pulse' 
                    : isPast 
                      ? 'bg-sentinel-emerald/20 border-sentinel-emerald text-sentinel-emerald' 
                      : 'bg-white/5 border-white/10 text-gray-500'
                }`}>
                  <step.icon size={20} />
                </div>
                <span className={`text-[10px] font-mono uppercase tracking-widest ${
                  isActive ? 'text-sentinel-cyan font-bold' : isPast ? 'text-sentinel-emerald' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`w-12 h-1 relative overflow-hidden rounded-full ${isPast ? 'bg-sentinel-emerald' : 'bg-white/10'}`}>
                  {isActive && (
                    <div className="absolute inset-0 bg-sentinel-cyan w-full animate-[slide_1s_ease-in-out_infinite]" style={{
                      backgroundImage: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.8), transparent)',
                    }}></div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
