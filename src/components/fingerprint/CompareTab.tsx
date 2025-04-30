import { useCallback, useEffect } from 'react';
import { ScanResult, CompareResult, FingerprintImage, CompareSubTabType } from './types';

interface CompareTabProps {
  scanResult: ScanResult | null;
  compareResult: CompareResult | null;
  onSwitchToCapture: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>, imageNumber: number) => void;
  onCompare: () => void;
  image1: FingerprintImage | null;
  image2: FingerprintImage | null;
  setImage1: (image: FingerprintImage | null) => void;
  setImage2: (image: FingerprintImage | null) => void;
  canCompare: boolean;
  activeSubTab: CompareSubTabType;
  onSubTabChange: (tab: CompareSubTabType) => void;
}

export default function CompareTab({
  scanResult,
  compareResult,
  onSwitchToCapture,
  onImageUpload,
  onCompare,
  image1,
  image2,
  setImage1,
  setImage2,
  canCompare,
  activeSubTab,
  onSubTabChange
}: CompareTabProps) {
  const handleScanResult = useCallback((imageNumber: number) => {
    if (scanResult) {
      const fingerprintImage: FingerprintImage = {
        image: scanResult.image,
        quality: scanResult.quality
      };
      if (imageNumber === 1) {
        setImage1(fingerprintImage);
      } else {
        setImage2(fingerprintImage);
      }
    }
  }, [scanResult, setImage1, setImage2]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Comparaison d'empreintes</h3>
        <button
          onClick={onSwitchToCapture}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retour à la capture
        </button>
      </div>

      {/* Sous-tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${activeSubTab === 'upload' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => onSubTabChange('upload')}
        >
          Upload d'images
        </button>
        <button
          className={`px-4 py-2 ${activeSubTab === 'scan' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => onSubTabChange('scan')}
        >
          Comparaison des scans
        </button>
      </div>

      {activeSubTab === 'upload' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Image 1</h4>
            {image1 ? (
              <div className="space-y-2">
                <img
                  src={image1.image}
                  alt="Fingerprint 1"
                  className="w-full h-64 object-contain border rounded"
                />
                <button
                  onClick={() => setImage1(null)}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Supprimer
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImageUpload(e, 1)}
                  className="hidden"
                  id="image1-upload"
                />
                <label
                  htmlFor="image1-upload"
                  className="cursor-pointer block"
                >
                  Cliquez pour télécharger l'image 1
                </label>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Image 2</h4>
            {image2 ? (
              <div className="space-y-2">
                <img
                  src={image2.image}
                  alt="Fingerprint 2"
                  className="w-full h-64 object-contain border rounded"
                />
                <button
                  onClick={() => setImage2(null)}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Supprimer
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImageUpload(e, 2)}
                  className="hidden"
                  id="image2-upload"
                />
                <label
                  htmlFor="image2-upload"
                  className="cursor-pointer block"
                >
                  Cliquez pour télécharger l'image 2
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'scan' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Scan 1</h4>
            {scanResult ? (
              <div className="space-y-2">
                <img
                  src={`data:image/png;base64,${scanResult.image}`}
                  alt="Fingerprint Scan 1"
                  className="w-full h-64 object-contain border rounded"
                />
                <button
                  onClick={() => {
                    setImage1({
                      image: `data:image/png;base64,${scanResult.image}`,
                      quality: scanResult.quality
                    });
                  }}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Utiliser ce scan
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
                <p>Aucun scan disponible</p>
                <button
                  onClick={onSwitchToCapture}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Faire un scan
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Scan 2</h4>
            {scanResult ? (
              <div className="space-y-2">
                <img
                  src={`data:image/png;base64,${scanResult.image}`}
                  alt="Fingerprint Scan 2"
                  className="w-full h-64 object-contain border rounded"
                />
                <button
                  onClick={() => {
                    setImage2({
                      image: `data:image/png;base64,${scanResult.image}`,
                      quality: scanResult.quality
                    });
                  }}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Utiliser ce scan
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
                <p>Aucun scan disponible</p>
                <button
                  onClick={onSwitchToCapture}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Faire un scan
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {canCompare && (
        <div className="flex justify-center">
          <button
            onClick={onCompare}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Comparer les empreintes
          </button>
        </div>
      )}

      {compareResult && (
        <div className="mt-4 p-4 bg-gray-800 rounded">
          <h4 className="font-medium mb-2">Résultat de la comparaison</h4>
          <p>Score: {compareResult.score}</p>
          <p>Correspondance: {compareResult.matched ? 'Oui' : 'Non'}</p>
          <p>Statut: {compareResult.status}</p>
        </div>
      )}
    </div>
  );
} 