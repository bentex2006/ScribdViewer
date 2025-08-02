import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, CheckCircle, XCircle, Play } from "lucide-react";
import { validateScribdUrl } from "@/lib/url-validation";

interface UrlInputProps {
  onLoadDocument: (url: string) => void;
  isLoading?: boolean;
}

export default function UrlInput({ onLoadDocument, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("https://www.scribd.com/document/538809827/MONEY-AND-BANKING-NOTES");
  const [isValid, setIsValid] = useState(true);

  const handleInputChange = (value: string) => {
    setUrl(value);
    setIsValid(value === "" || validateScribdUrl(value));
  };

  const handleLoadDocument = () => {
    if (validateScribdUrl(url)) {
      onLoadDocument(url);
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Enter Scribd Document URL</h2>
          <p className="text-sm text-slate-600">Paste any Scribd document link to view it with enhanced readability</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Input
                type="url"
                placeholder="https://www.scribd.com/document/..."
                value={url}
                onChange={(e) => handleInputChange(e.target.value)}
                className="pl-12 py-3"
              />
              <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            </div>
          </div>
          
          <Button 
            onClick={handleLoadDocument}
            disabled={!validateScribdUrl(url) || isLoading}
            className="px-8 py-3 flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>{isLoading ? "Loading..." : "Load Document"}</span>
          </Button>
        </div>

        {/* URL Validation Status */}
        {url && (
          <div className="mt-4 flex items-center space-x-2 text-sm">
            {isValid ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Valid Scribd URL detected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <XCircle className="h-4 w-4" />
                <span>Invalid URL format</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
