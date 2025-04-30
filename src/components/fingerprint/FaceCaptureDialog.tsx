import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-hot-toast';

interface FaceCaptureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (image: string) => void;
}

interface CameraDevice {
  deviceId: string;
  label: string;
}

export default function FaceCaptureDialog({ isOpen, onClose, onCapture }: FaceCaptureDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');

  useEffect(() => {
    if (isOpen && mode === 'camera') {
      getCameras();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode]);

  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Caméra ${device.deviceId.slice(0, 5)}`
        }));
      setCameras(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].deviceId);
        startCamera(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Erreur lors de l\'accès aux caméras:', error);
      toast.error('Impossible d\'accéder aux caméras');
    }
  };

  const startCamera = async (deviceId: string) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          deviceId: { exact: deviceId },
          facingMode: 'user'
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      console.error('Erreur lors de l\'accès à la caméra:', error);
      toast.error('Impossible d\'accéder à la caméra sélectionnée');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId);
    stopCamera();
    startCamera(deviceId);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setCapturedImage(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Veuillez sélectionner une image valide');
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
          <Dialog.Title className="text-lg font-medium mb-4">
            Capture faciale
          </Dialog.Title>

          <div className="space-y-4">
            {!capturedImage ? (
              <div className="space-y-4">
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => setMode('camera')}
                    className={`flex-1 py-2 px-4 rounded ${
                      mode === 'camera'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Caméra
                  </button>
                  <button
                    onClick={() => setMode('upload')}
                    className={`flex-1 py-2 px-4 rounded ${
                      mode === 'upload'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Upload
                  </button>
                </div>

                {mode === 'camera' ? (
                  <>
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="camera-select" className="text-sm font-medium text-gray-700">
                        Sélectionner la caméra
                      </label>
                      <select
                        id="camera-select"
                        value={selectedCamera}
                        onChange={(e) => handleCameraChange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        {cameras.length === 0 ? (
                          <option value="" disabled>Aucune caméra disponible</option>
                        ) : (
                          cameras.map(camera => (
                            <option key={camera.deviceId} value={camera.deviceId}>
                              {camera.label}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full rounded"
                      />
                      <button
                        onClick={captureImage}
                        className="absolute bottom-4 left-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Capturer
                      </button>
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Sélectionner une image
                    </button>
                    <p className="text-sm text-gray-500">
                      Formats acceptés : JPG, PNG, GIF
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <img
                  src={capturedImage}
                  alt="Visage capturé"
                  className="w-full rounded"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setCapturedImage(null)}
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
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 