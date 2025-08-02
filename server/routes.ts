import type { Express } from "express";
import { createServer, type Server } from "http";
import { scribdUrlSchema } from "@shared/schema";
import { storage } from "./storage";
import { z } from "zod";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // History management endpoints
  app.get("/api/history", async (req, res) => {
    try {
      const history = await storage.getHistory();
      res.json(history);
    } catch (error) {
      console.error('History error:', error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  app.post("/api/history", async (req, res) => {
    try {
      const { url, title } = req.body;
      const id = nanoid();
      const historyItem = await storage.addToHistory({ id, url, title });
      res.json(historyItem);
    } catch (error) {
      console.error('Add to history error:', error);
      res.status(500).json({ message: "Failed to add to history" });
    }
  });

  app.delete("/api/history/:id", async (req, res) => {
    try {
      await storage.removeFromHistory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Remove from history error:', error);
      res.status(500).json({ message: "Failed to remove from history" });
    }
  });

  app.delete("/api/history", async (req, res) => {
    try {
      await storage.clearHistory();
      res.json({ success: true });
    } catch (error) {
      console.error('Clear history error:', error);
      res.status(500).json({ message: "Failed to clear history" });
    }
  });

  // Proxy endpoint to fetch Scribd document with injected CSS
  app.post("/api/proxy-scribd", async (req, res) => {
    try {
      const { url } = scribdUrlSchema.parse(req.body);
      
      // Fetch the original Scribd page
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });

      if (!response.ok) {
        return res.status(400).json({ 
          message: `Failed to fetch document: ${response.statusText}` 
        });
      }

      let html = await response.text();
      
      // Simple and safe disblur CSS
      const disblurCSS = `
        <style>
          /* Remove blur effects */
          * {
            filter: none !important;
            backdrop-filter: none !important;
          }

          div[style*="blur"],
          span[style*="blur"],
          p[style*="blur"] {
            filter: none !important;
            backdrop-filter: none !important;
          }

          .auto__doc_page_webpack_doc_page_blur_promo {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }

          .text_layer, .newpage span, span.a, p {
            text-shadow: none !important;
            color: black !important;
            filter: none !important;
          }

          img {
            opacity: 1 !important;
            filter: none !important;
          }

          /* Mobile responsive optimizations */
          @media (max-width: 768px) {
            body {
              margin: 0 !important;
              padding: 0 !important;
            }
            
            .document_container,
            .doc_container,
            .page_container {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 10px !important;
            }
            
            .page,
            .doc_page {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 auto !important;
              transform: scale(1) !important;
            }
          }
        </style>
        <script>
          // Simple header removal script
          function removeHeaderElements() {
            // Remove common header selectors
            const headersToRemove = document.querySelectorAll('header, nav, [role="banner"], [role="navigation"]');
            headersToRemove.forEach(el => {
              const text = el.textContent || '';
              if (text.includes('Scribd') || text.includes('Upload') || text.includes('Sign in') || text.includes('Search')) {
                el.style.display = 'none';
              }
            });

            // Remove elements with specific text content
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
              const text = el.textContent || '';
              if (el.tagName === 'BUTTON' || el.tagName === 'A') {
                if (text.includes('Upload') || text.includes('Sign in') || text.includes('Download free') || text.includes('Change Language')) {
                  el.style.display = 'none';
                }
              }
            });
          }

          // Run header removal
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', removeHeaderElements);
          } else {
            removeHeaderElements();
          }
          
          // Run again after a delay for dynamic content
          setTimeout(removeHeaderElements, 500);
        </script>
      `;
      
      // Inject CSS before closing head tag
      html = html.replace('</head>', `${disblurCSS}</head>`);
      
      // Set appropriate headers
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      
      res.send(html);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: error.errors[0]?.message || "Invalid URL format" 
        });
      }
      
      console.error('Proxy error:', error);
      res.status(500).json({ 
        message: "Failed to proxy document. Please check the URL and try again." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}