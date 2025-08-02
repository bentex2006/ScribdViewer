import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Maximize2, Minimize2 } from "lucide-react";
import { extractDocumentInfo } from "@/lib/url-validation";

interface DocumentViewerProps {
  documentUrl?: string;
  isLoading?: boolean;
  error?: string;
  documentHtml?: string;
}

export default function DocumentViewer({ documentUrl, isLoading, error, documentHtml }: DocumentViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const documentInfo = documentUrl ? extractDocumentInfo(documentUrl) : null;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && containerRef.current) {
        await containerRef.current.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.log('Fullscreen error:', error);
    }
  };

  return (
    <Card className={`overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`} ref={containerRef}>
      {documentUrl && (
        <div className={`border-b border-slate-200 p-4 bg-slate-50 ${isFullscreen ? 'flex items-center justify-between' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">Document Loaded</span>
              {documentInfo && (
                <span className="text-xs text-slate-500">{documentInfo.title}</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-xs text-slate-500">
                Enhanced readability active
              </div>
              {documentHtml && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-slate-600 hover:text-slate-900"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-60px)]' : 'h-[800px]'}`}>
        {error ? (
          <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-red-500 h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Document</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading document...</p>
            </div>
          </div>
        ) : documentHtml ? (
          <iframe
            ref={iframeRef}
            srcDoc={documentHtml}
            className="w-full h-full border-0"
            title="Scribd Document"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-blue-600 h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Document Ready to Load</h3>
              <p className="text-slate-600 text-sm mb-6">
                Enter a Scribd document URL above to view it with enhanced readability and all blur effects removed.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
