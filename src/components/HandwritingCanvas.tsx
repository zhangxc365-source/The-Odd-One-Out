import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface HandwritingCanvasProps {
  target: string;
  onClose: () => void;
}

const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({ target, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    ctxRef.current = canvas.getContext('2d', { willReadFrequently: true });
    
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent && canvas) {
        const tempImage = canvas.toDataURL();
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        const img = new Image();
        img.src = tempImage;
        img.onload = () => {
          ctxRef.current?.drawImage(img, 0, 0);
          if (ctxRef.current) setupCtx(ctxRef.current);
        };
      }
    };
    
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas.parentElement!);
    
    return () => resizeObserver.disconnect();
  }, []);

  const setupCtx = (ctx: CanvasRenderingContext2D) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 30;
    ctx.strokeStyle = '#064e3b';
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      if (e.cancelable) e.preventDefault();
    }
    
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    
    setIsDrawing(true);
    setupCtx(ctxRef.current);

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctxRef.current || !canvasRef.current) return;
    
    if ('touches' in e) {
      if (e.cancelable) e.preventDefault();
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
    
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  const checkAccuracy = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    
    const userData = ctxRef.current.getImageData(0, 0, canvas.width, canvas.height).data;
    let coloredPixels = 0;
    for (let i = 3; i < userData.length; i += 4) {
      if (userData[i] > 50) coloredPixels++; 
    }

    if (coloredPixels > 3000) {
      alert("写得不错！👏");
      onClose();
    } else {
      alert("请写得更完整一点哦。");
    }
  };

  return (
    <div className="flex flex-col items-center w-full gap-8">
      <div className="relative w-full aspect-square bg-white border-8 border-art-yellow-border rounded-[3rem] overflow-hidden shadow-inner group">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-10 p-16">
          <span className="text-[18rem] font-serif font-black text-black leading-none">{target}</span>
        </div>
        
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="relative z-10 w-full h-full cursor-crosshair touch-none"
        />
      </div>

      <div className="flex gap-4 w-full">
         <button 
           onClick={clearCanvas}
           className="flex-1 bg-white border-4 border-art-amber py-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all text-art-amber-dark group flex items-center justify-center gap-3 font-black uppercase tracking-widest"
         >
           <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
           RETRY
         </button>
         <button 
           onClick={checkAccuracy}
           className="flex-[2] bg-art-emerald text-white border-4 border-art-emerald-dark py-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all font-black text-2xl tracking-[0.2em]"
         >
           DONE
         </button>
      </div>
    </div>
  );
};

export default HandwritingCanvas;
