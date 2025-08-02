import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { History, Trash2, Clock, ExternalLink, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { HistoryItem } from "@shared/schema";

interface HistoryPanelProps {
  onLoadDocument: (url: string) => void;
}

export default function HistoryPanel({ onLoadDocument }: HistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["/api/history"],
    queryFn: async () => {
      try {
        const result = await apiRequest<HistoryItem[]>("GET", "/api/history");
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error("Failed to fetch history:", error);
        return [];
      }
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/history"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "History cleared",
        description: "All viewing history has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear history.",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/history/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "Item removed",
        description: "Document removed from history.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from history.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleLoadFromHistory = (url: string) => {
    onLoadDocument(url);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <History className="h-4 w-4" />
          <span>History</span>
          {history.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {history.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Viewing History</span>
            </div>
            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearHistoryMutation.mutate()}
                disabled={clearHistoryMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No History Yet</h3>
              <p className="text-slate-600 text-sm">
                Documents you view will appear here for quick access later.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4">
                {history.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-slate-900 text-sm leading-tight">
                          {item.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItemMutation.mutate(item.id)}
                          disabled={removeItemMutation.isPending}
                          className="text-slate-400 hover:text-red-600 p-1 h-auto"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-500">
                          {formatDate(item.viewedAt)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Scribd
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleLoadFromHistory(item.url)}
                          className="flex-1"
                        >
                          View Again
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}