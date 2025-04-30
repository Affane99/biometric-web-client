'use client';

// components/FingerprintScanner.tsx
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import CaptureTab from './fingerprint/CaptureTab';
import CompareTab from './fingerprint/CompareTab';
import FaceCaptureTab from './fingerprint/FaceCaptureTab';
import { Scanner, ScanResult, CompareResult, TabType, FingerprintImage, FaceImage, FaceCompareResult, CompareSubTabType } from './fingerprint/types';

export default function FingerprintScanner() {
  const [activeTab, setActiveTab] = useState<TabType>('capture');
  const [activeSubTab, setActiveSubTab] = useState<CompareSubTabType>('upload');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [scanners, setScanners] = useState<Scanner[]>([]);
  const [selectedScanner, setSelectedScanner] = useState<string>('');
  const [scanStatus, setScanStatus] = useState<string>('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [image1, setImage1] = useState<FingerprintImage | null>(null);
  const [image2, setImage2] = useState<FingerprintImage | null>(null);
  const [storedImage, setStoredImage] = useState<string | null>(null);
  const [faceImage, setFaceImage] = useState<FaceImage | null>(null);
  const [face1, setFace1] = useState<FaceImage | null>(null);
  const [face2, setFace2] = useState<FaceImage | null>(null);
  const [faceCompareResult, setFaceCompareResult] = useState<FaceCompareResult | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8181');
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ action: 'getScanners' }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Message reçu du serveur:', data);
      
      switch (data.action) {
        case 'scannersList':
          setScanners(data.data);
          break;
        case 'scanStatus':
          setScanStatus(data.data);
          break;
        case 'scanComplete':
          setScanResult(data.data);
          break;
        case 'compareResult':
          setCompareResult(data.data);
          break;
        case 'faceCaptured':
          setFaceImage(data.data);
          break;
        case 'faceCompareResult':
          console.log('Résultat de la comparaison faciale:', data.data);
          setFaceCompareResult(data.data);
          break;
        case 'error':
          console.error('Erreur du serveur:', data.data);
          toast.error(data.data);
          break;
      }
    };

    ws.onclose = () => {
      console.log('Connexion WebSocket fermée');
    };

    ws.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
      toast.error('Erreur de connexion au serveur');
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const startScan = useCallback(() => {
    if (socket && selectedScanner) {
      socket.send(JSON.stringify({
        action: 'startScan',
        data: { scannerId: selectedScanner }
      }));
    }
  }, [socket, selectedScanner]);

  const stopScan = useCallback(() => {
    if (socket) {
      socket.send(JSON.stringify({ action: 'stopScan' }));
    }
  }, [socket]);

  const saveImage = useCallback(() => {
    if (scanResult?.image) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${scanResult.image}`;
      link.download = `fingerprint_${new Date().toISOString()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [scanResult]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>, imageNumber: number) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        const fingerprintImage: FingerprintImage = {
          image: base64Image,
          quality: null
        };
        
        if (imageNumber === 1) {
          setImage1(fingerprintImage);
        } else {
          setImage2(fingerprintImage);
        }
        
        if (socket) {
          socket.send(JSON.stringify({
            action: 'extractTemplateFromImage',
            data: {
              image: base64Image.split(',')[1],
              imageNumber: imageNumber
            }
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  }, [socket]);

  const compareFingerprints = useCallback(() => {
    if (socket && image1?.image && image2?.image) {
      socket.send(JSON.stringify({
        action: 'compareImages',
        data: {
          image1: image1.image.split(',')[1],
          image2: image2.image.split(',')[1]
        }
      }));
    }
  }, [socket, image1, image2]);

  const handleSubTabChange = useCallback((tab: CompareSubTabType) => {
    setActiveSubTab(tab);
  }, []);

  const storeImage = useCallback(() => {
    if (scanResult) {
      setStoredImage(scanResult.image);
    }
  }, [scanResult]);

  const compareImages = useCallback(() => {
    if (socket && scanResult && storedImage) {
      socket.send(JSON.stringify({
        action: 'compareImages',
        data: {
          image1: storedImage,
          image2: scanResult.image
        }
      }));
    }
  }, [socket, scanResult, storedImage]);

  const captureFace = useCallback(() => {
    if (socket) {
      socket.send(JSON.stringify({ action: 'captureFace' }));
      toast.loading('Capture du visage en cours...');
    }
  }, [socket]);

  const compareFaces = useCallback(() => {
    if (socket && face1?.image && face2?.image) {
      const base64Image1 = face1.image.split(',')[1];
      const base64Image2 = face2.image.split(',')[1];

      socket.send(JSON.stringify({
        action: 'compareFaces',
        data: {
          face1: base64Image1,
          face2: base64Image2
        }
      }));
      toast.loading('Comparaison des visages en cours...');
    } else {
      toast.error('Veuillez capturer les deux visages avant de comparer');
    }
  }, [socket, face1, face2]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Scanner biométrique</h2>
      
      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'capture' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('capture')}
        >
          Capture d'empreintes
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'compare' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('compare')}
        >
          Comparaison d'empreintes
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'face' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('face')}
        >
          Reconnaissance faciale
        </button>
      </div>

      {activeTab === 'capture' && (
        <CaptureTab
          scanners={scanners}
          selectedScanner={selectedScanner}
          scanStatus={scanStatus}
          scanResult={scanResult}
          onScannerChange={setSelectedScanner}
          onStartScan={startScan}
          onStopScan={stopScan}
          onStoreTemplate={() => {
            if (scanResult) {
              setImage1({
                image: scanResult.image,
                quality: scanResult.quality
              });
            }
          }}
          onSaveImage={saveImage}
          onStoreImage={storeImage}
          storedImage={storedImage}
          onCompareImages={compareImages}
        />
      )}

      {activeTab === 'compare' && (
        <CompareTab
          scanResult={scanResult}
          compareResult={compareResult}
          onSwitchToCapture={() => setActiveTab('capture')}
          onImageUpload={handleImageUpload}
          onCompare={compareFingerprints}
          image1={image1}
          image2={image2}
          setImage1={setImage1}
          setImage2={setImage2}
          canCompare={!!(image1?.image && image2?.image)}
          activeSubTab={activeSubTab}
          onSubTabChange={handleSubTabChange}
        />
      )}

      {activeTab === 'face' && (
        <FaceCaptureTab
          faceImage={faceImage}
          onCaptureFace={captureFace}
          onCompareFaces={compareFaces}
          face1={face1}
          face2={face2}
          setFace1={setFace1}
          setFace2={setFace2}
          canCompare={!!(face1?.image && face2?.image)}
          compareResult={faceCompareResult}
        />
      )}
    </div>
  );
}