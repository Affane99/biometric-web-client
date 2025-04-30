import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function ScannerPage() {
  const [socketStatus, setSocketStatus] = useState('Disconnected');
  const [captureResult, setCaptureResult] = useState(null);
  const socketRef = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
    socketRef.current = new WebSocket('ws://localhost:8181');
    
    socketRef.current.onopen = () => {
      console.log('Connected to WebSocket server');
      setSocketStatus('Connected');
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.action === 'captureComplete') {
          setCaptureResult(data.data);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setSocketStatus('Error');
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setSocketStatus('Closed');
    };
  };

  const startCapture = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: 'capture' }));
    } else {
      console.error('WebSocket not connected');
    }
  };

  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fingerprint Scanner</h1>
        <Link href="/chat" className="text-blue-500 hover:text-blue-700">
          Go to Chat →
        </Link>
      </div>

      <div className="mb-4">
        <p>WebSocket Status: {socketStatus}</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={connectWebSocket}
          disabled={socketStatus === 'Connected'}
          className={`px-4 py-2 rounded ${
            socketStatus === 'Connected'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-700'
          } text-white`}
        >
          {socketStatus === 'Connected' ? 'Connected' : 'Connect'}
          {socketStatus === 'Connected' && (
            <span className="ml-2 text-green-400">●</span>
          )}
        </button>

        <button
          onClick={startCapture}
          disabled={socketStatus !== 'Connected'}
          className={`px-4 py-2 rounded ${
            socketStatus !== 'Connected'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-700'
          } text-white`}
        >
          Start Capture
        </button>
      </div>

      {captureResult ? (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Capture Result</h2>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(captureResult, null, 2)}
          </pre>
        </div>
      ) : (
        <p className="text-gray-600">Waiting for capture...</p>
      )}
    </div>
  );
}
