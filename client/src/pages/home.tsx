import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import UrlInput from "@/components/url-input";
import ControlPanel from "@/components/control-panel";
import DocumentViewer from "@/components/document-viewer";
import HistoryPanel from "@/components/history-panel";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { extractDocumentInfo } from "@/lib/url-validation";

export default function Home() {
  const [currentDocumentUrl, setCurrentDocumentUrl] = useState<string>();
  const [documentHtml, setDocumentHtml] = useState<string>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loadDocumentMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch("/api/proxy-scribd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load document");
      }
      
      const html = await response.text();
      return { html, url };
    },
    onSuccess: async (data) => {
      setCurrentDocumentUrl(data.url);
      setDocumentHtml(data.html);
      
      // Add to history
      const documentInfo = extractDocumentInfo(data.url);
      if (documentInfo) {
        try {
          await apiRequest("POST", "/api/history", {
            url: data.url,
            title: documentInfo.title,
          });
          queryClient.invalidateQueries({ queryKey: ["/api/history"] });
        } catch (error) {
          console.log("Failed to add to history:", error);
        }
      }
      
      toast({
        title: "Document loaded successfully",
        description: "The document is now displaying with enhanced readability.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to load document",
        description: error.message || "Please check the URL and try again.",
        variant: "destructive",
      });
    },
  });

  const handleLoadDocument = (url: string) => {
    loadDocumentMutation.mutate(url);
  };

  const handleRefresh = () => {
    if (currentDocumentUrl) {
      loadDocumentMutation.mutate(currentDocumentUrl);
    }
  };

  const handleOpenInNewTab = () => {
    if (currentDocumentUrl) {
      window.open(currentDocumentUrl, '_blank');
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="text-white h-4 w-4" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">Scribd Viewer</h1>
            </div>
            <div className="flex items-center space-x-4">
              <HistoryPanel onLoadDocument={handleLoadDocument} />
              <span className="text-sm text-slate-600">Clear Reading Mode</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UrlInput 
          onLoadDocument={handleLoadDocument}
          isLoading={loadDocumentMutation.isPending}
        />
        
        <ControlPanel
          onRefresh={handleRefresh}
          onOpenInNewTab={handleOpenInNewTab}
          onToggleFullscreen={handleToggleFullscreen}
          documentUrl={currentDocumentUrl}
        />
        
        <DocumentViewer
          documentUrl={currentDocumentUrl}
          isLoading={loadDocumentMutation.isPending}
          error={loadDocumentMutation.error?.message}
          documentHtml={documentHtml}
        />

        {/* Technical Info */}
        <Card className="mt-8 bg-slate-50 border-slate-200">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Applied Enhancements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Blur Removal</p>
                  <p className="text-xs text-slate-500">All filter and backdrop-filter effects removed</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Text Clarity</p>
                  <p className="text-xs text-slate-500">Text-shadow removed, color forced to black</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Image Visibility</p>
                  <p className="text-xs text-slate-500">Full opacity and filters removed from images</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Promo Hidden</p>
                  <p className="text-xs text-slate-500">Promotional blur overlays completely hidden</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
