import { FaceCaptureTabProps } from './types';
import { useState } from 'react';
import FaceCaptureDialog from './FaceCaptureDialog';

export default function FaceCaptureTab({
  onCompareFaces,
  face1,
  face2,
  setFace1,
  setFace2,
  canCompare,
  compareResult
}: FaceCaptureTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [captureTarget, setCaptureTarget] = useState<'face1' | 'face2' | null>(null);

  const handleCapture = (image: string) => {
    if (captureTarget === 'face1') {
      setFace1({ image });
    } else {
      setFace2({ image });
    }
    setCaptureTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Reconnaissance faciale</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium">Visage 1</h4>
          {face1 ? (
            <div className="space-y-2">
              <img
                src={face1.image}
                alt="Face 1"
                className="w-full h-64 object-contain border rounded"
              />
              <button
                onClick={() => setFace1(null)}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
              <button
                onClick={() => {
                  setCaptureTarget('face1');
                  setIsDialogOpen(true);
                }}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Capturer le visage 1
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Visage 2</h4>
          {face2 ? (
            <div className="space-y-2">
              <img
                src={face2.image}
                alt="Face 2"
                className="w-full h-64 object-contain border rounded"
              />
              <button
                onClick={() => setFace2(null)}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
              <button
                onClick={() => {
                  setCaptureTarget('face2');
                  setIsDialogOpen(true);
                }}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Capturer le visage 2
              </button>
            </div>
          )}
        </div>
      </div>

      {canCompare && (
        <div className="flex justify-center">
          <button
            onClick={onCompareFaces}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Comparer les visages
          </button>
        </div>
      )}

      {compareResult && (
        <div className="mt-4 p-4 bg-gray-800 rounded text-white">
          <h4 className="font-medium mb-2">Résultat de la comparaison</h4>
          <p>Correspondance: {compareResult.matched ? 'Oui' : 'Non'}</p>
        </div>
      )}

      <FaceCaptureDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCapture={handleCapture}
      />
    </div>
  );
} 