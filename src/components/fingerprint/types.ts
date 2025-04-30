export interface Scanner {
  id: string;
  name: string;
}

export interface ScanResult {
  image: string;
  quality: number;
  width: number;
  height: number;
}

export interface CompareResult {
  score: number;
  matched: boolean;
  status: string;
}

export interface FingerprintImage {
  image: string;
  quality: number | null;
}

export interface FaceImage {
  image: string;
}

export interface FaceCompareResult {
  matched: boolean;
}

export type TabType = 'capture' | 'compare' | 'face';
export type CompareSubTabType = 'upload' | 'scan';

export interface CompareTabProps {
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

export interface CaptureTabProps {
  scanners: Scanner[];
  selectedScanner: string;
  scanStatus: string;
  scanResult: ScanResult | null;
  onScannerChange: (scannerId: string) => void;
  onStartScan: () => void;
  onStopScan: () => void;
  onSaveImage: () => void;
  onStoreImage: () => void;
  storedImage: string | null;
  onCompareImages: () => void;
}

export interface FaceCaptureTabProps {
  faceImage: FaceImage | null;
  onCaptureFace: () => void;
  onCompareFaces: () => void;
  face1: FaceImage | null;
  face2: FaceImage | null;
  setFace1: (face: FaceImage | null) => void;
  setFace2: (face: FaceImage | null) => void;
  canCompare: boolean;
  compareResult: FaceCompareResult | null;
} 