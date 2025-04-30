import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-hot-toast';

interface FingerImage {
  position: string;
  image: string;
  quality: number;
  width: number;
  height: number;
}

interface PalmCaptureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (images: FingerImage[]) => void;
  scannerId: string;
}

export default function PalmCaptureDialog({ isOpen, onClose, onCapture, scannerId }: PalmCaptureDialogProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImages, setCapturedImages] = useState<FingerImage[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (isOpen) {
      const websocket = new WebSocket('ws://localhost:8080');
      setWs(websocket);

      websocket.onopen = () => {
        console.log('WebSocket connected');
        startScan(websocket);
      };

      websocket.onmessage = (event) => {
        const response = JSON.parse(event.data);
        handleWebSocketMessage(response);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Erreur de connexion au scanner');
      };

      websocket.onclose = () => {
        console.log('WebSocket disconnected');
      };

      return () => {
        websocket.close();
      };
    }
  }, [isOpen]);

  const startScan = (websocket: WebSocket) => {
    const scanRequest = {
      action: "startScan",
      data: {
        scannerId: scannerId,
        scanType: "palm"
      }
    };
    websocket.send(JSON.stringify(scanRequest));
    setIsScanning(true);
  };

  const handleWebSocketMessage = (response: any) => {
    if (response.action === "scanComplete") {
      setCapturedImages(response.data);
      setIsScanning(false);
    } else if (response.action === "error") {
      toast.error(response.message || 'Erreur lors de la capture');
      setIsScanning(false);
    }
  };

  const handleConfirm = () => {
    if (capturedImages.length > 0) {
      onCapture(capturedImages);
      onClose();
    }
  };

  const getFingerName = (position: string) => {
    const fingerNames: { [key: string]: string } = {
      'LeftIndex': 'Index gauche',
      'LeftMiddle': 'Majeur gauche',
      'LeftRing': 'Annulaire gauche',
      'LeftLittle': 'Auriculaire gauche',
      'RightIndex': 'Index droit',
      'RightMiddle': 'Majeur droit',
      'RightRing': 'Annulaire droit',
      'RightLittle': 'Auriculaire droit'
    };
    return fingerNames[position] || position;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl rounded bg-white p-6">
          <Dialog.Title className="text-lg font-medium mb-4">
            Capture de la paume
          </Dialog.Title>

          <div className="space-y-4">
            {isScanning ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Capture en cours...</p>
              </div>
            ) : capturedImages.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {capturedImages.map((finger, index) => (
                    <div key={index} className="space-y-2">
                      <img
                        src={finger.image}
                        alt={`Doigt ${finger.position}`}
                        className="w-full rounded border border-gray-200"
                      />
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{getFingerName(finger.position)}</p>
                        <p>Qualité: {finger.quality}%</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setCapturedImages([]);
                      if (ws) startScan(ws);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Reprendre
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Prêt à capturer la paume</p>
                <button
                  onClick={() => ws && startScan(ws)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Démarrer la capture
                </button>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 