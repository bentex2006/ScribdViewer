import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Expand, Eye, Image } from "lucide-react";

interface ControlPanelProps {
  onRefresh: () => void;
  onOpenInNewTab: () => void;
  onToggleFullscreen: () => void;
  documentUrl?: string;
}

export default function ControlPanel({ 
  onRefresh, 
  onOpenInNewTab, 
  onToggleFullscreen,
  documentUrl 
}: ControlPanelProps) {
  return (
    <Card className="mb-8">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">DisBlur Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">Enhanced Readability</span>
            </div>
            <div className="flex items-center space-x-2">
              <Image className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">Clear Images</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              title="Refresh Document"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenInNewTab}
              title="Open in New Tab"
              disabled={!documentUrl}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFullscreen}
              title="Toggle Fullscreen"
            >
              <Expand className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
