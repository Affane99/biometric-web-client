import { useCallback } from 'react';
import { Scanner, ScanResult } from './types';

interface CaptureTabProps {
  scanners: Scanner[];
  selectedScanner: string;
  scanStatus: string;
  scanResult: ScanResult | null;
  onScannerChange: (scannerId: string) => void;
  onStartScan: () => void;
  onStopScan: () => void;
  onStoreTemplate: () => void;
  onSaveImage: () => void;
  onStoreImage: () => void;
  storedImage: string | null;
  onCompareImages: () => void;
}

export default function CaptureTab({
  scanners,
  selectedScanner,
  scanStatus,
  scanResult,
  onScannerChange,
  onStartScan,
  onStopScan,
  onStoreTemplate,
  onSaveImage,
  onStoreImage,
  storedImage,
  onCompareImages
}: CaptureTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Capture d'empreintes</h3>
        <select
          value={selectedScanner}
          onChange={(e) => onScannerChange(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">Sélectionner un scanner</option>
          {scanners.map((scanner) => (
            <option key={scanner.id} value={scanner.id}>
              {scanner.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onStartScan}
          disabled={!selectedScanner}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Démarrer le scan
        </button>
        <button
          onClick={onStopScan}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Arrêter le scan
        </button>
      </div>

      {scanStatus && (
        <p className="text-gray-600">{scanStatus}</p>
      )}

      {scanResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Résultat du scan</h4>
              <img
                src={`data:image/png;base64,${scanResult.image}`}
                alt="Fingerprint Scan"
                className="w-full h-64 object-contain border rounded"
              />
              <div className="flex gap-2">
                <button
                  onClick={onStoreTemplate}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Stocker le template
                </button>
                <button
                  onClick={onSaveImage}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Sauvegarder l'image
                </button>
                <button
                  onClick={onStoreImage}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  Stocker l'image
                </button>
              </div>
            </div>

            {storedImage && (
              <div className="space-y-2">
                <h4 className="font-medium">Image stockée</h4>
                <img
                  src={`data:image/png;base64,${storedImage}`}
                  alt="Stored Fingerprint"
                  className="w-full h-64 object-contain border rounded"
                />
                <button
                  onClick={onCompareImages}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Comparer avec le scan
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 