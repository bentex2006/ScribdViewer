import type { Express } from "express";
import { createServer, type Server } from "http";
import { scribdUrlSchema, historyItemSchema } from "@shared/schema";
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
      
      // Simple disblur CSS injection
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

          /* Hide unwanted UI elements */
          .doc_info,
          .document_info,
          .ratings_summary,
          .ratings,
          .upload_info,
          .uploader_info,
          .download_buttons,
          .action_buttons,
          .save_buttons,
          .share_buttons,
          .report_buttons,
          .embed_buttons,
          .print_buttons,
          .download_banner,
          .subscription_banner,
          .premium_banner,
          .footer,
          .header_nav,
          .top_nav,
          .side_nav,
          .recommendations,
          .related_docs,
          .ads,
          .advertisement,
          header,
          nav,
          .navigation,
          .nav,
          .menu,
          .header,
          .top-bar,
          .navbar,
          .search,
          .search-bar,
          .upload,
          .signin,
          .sign-in,
          .login,
          .language,
          .lang,
          [role="banner"],
          [role="navigation"],
          [class*="header"],
          [class*="nav"],
          [class*="menu"],
          [class*="search"],
          [class*="upload"],
          [class*="signin"],
          [class*="login"],
          [class*="language"],
          [class*="rating"],
          [class*="download"],
          [class*="save"],
          [class*="share"],
          [class*="embed"],
          [class*="report"],
          [class*="upload"],
          [data-e2e*="rating"],
          [data-e2e*="download"],
          [data-e2e*="save"],
          [data-e2e*="share"],
          [data-e2e*="embed"],
          [data-e2e*="report"],
          [data-e2e*="header"],
          [data-e2e*="nav"],
          [data-e2e*="menu"],
          [data-e2e*="search"],
          [data-e2e*="upload"],
          [data-e2e*="signin"],
          [data-e2e*="login"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
          }

          /* More aggressive header hiding */
          body > header,
          body > nav,
          body > div:first-child:has(nav),
          body > div:first-child:has(header),
          div[data-testid*="header"],
          div[data-testid*="nav"],
          div[id*="header"],
          div[id*="nav"],
          div[class*="Header"],
          div[class*="Navigation"],
          div[class*="TopBar"],
          div[class*="NavBar"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            position: absolute !important;
            top: -9999px !important;
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
            
            /* Ensure text is readable on mobile */
            .text_layer span,
            .textLayer span,
            p, div {
              font-size: 12px !important;
              line-height: 1.4 !important;
            }
          }

          /* Clean fullscreen experience */
          .document_viewer,
          .doc_viewer,
          .page_viewer {
            background: white !important;
            width: 100% !important;
            height: 100% !important;
          }

          /* Hide search and navigation when not needed */
          .search_container,
          .nav_container,
          .breadcrumb,
          .pagination_top {
            display: none !important;
          }

          /* Ultra-aggressive header removal - target everything that could be a header */
          div:has(> a[href*="scribd"]),
          div:has(> button:contains("Upload")),
          div:has(> button:contains("Sign")),
          div:has(> button:contains("Search")),
          div:has(> a:contains("Scribd")),
          div:has(> span:contains("Upload")),
          div:has(> span:contains("Sign")),
          div:has(> span:contains("Language")),
          div:has(> span:contains("Search")),
          div:has(> input[placeholder*="Search"]),
          [aria-label*="navigation"],
          [aria-label*="menu"],
          [aria-label*="header"],
          [data-reactid*="header"],
          [data-reactid*="nav"],
          section:has(nav),
          section:has(header),
          div[style*="position: fixed"][style*="top: 0"],
          div[style*="position: sticky"][style*="top: 0"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
            position: absolute !important;
            top: -9999px !important;
            left: -9999px !important;
            z-index: -9999 !important;
          }

          /* Force clean body layout */
          body {
            padding-top: 0 !important;
            margin-top: 0 !important;
          }

          /* Preserve document content positioning but reset others */
          .document,
          .doc,
          .page,
          .content,
          .text_layer,
          .textLayer,
          iframe,
          canvas,
          svg,
          .doc_page,
          .document_page,
          .page_container,
          .document_container,
          .viewer,
          .reader {
            position: relative !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
        </style>
        <script>
          // JavaScript to aggressively remove header elements after page load
          function removeHeaders() {
            // Remove elements containing specific text content
            const textToRemove = ['Upload', 'Sign in', 'Search', 'Scribd', 'Change Language', 'Download free', 'navigation menu'];
            
            textToRemove.forEach(text => {
              const elements = Array.from(document.querySelectorAll('*')).filter(el => 
                el.textContent && el.textContent.toLowerCase().includes(text.toLowerCase())
              );
              elements.forEach(el => {
                // Check if it's likely a header/nav element
                if (el.tagName === 'HEADER' || el.tagName === 'NAV' || 
                    el.closest('header') || el.closest('nav') ||
                    el.className.toLowerCase().includes('header') ||
                    el.className.toLowerCase().includes('nav') ||
                    el.style.position === 'fixed' ||
                    el.style.position === 'sticky') {
                  el.style.display = 'none';
                  el.style.visibility = 'hidden';
                  el.style.height = '0';
                  el.style.overflow = 'hidden';
                  el.remove();
                }
              });
            });

            // Remove only specific header elements, preserve document content
            const potentialHeaders = document.querySelectorAll('header, nav, [role="banner"], [role="navigation"]');
            potentialHeaders.forEach(el => {
              if (el.textContent.includes('Scribd') || 
                  el.textContent.includes('Upload') || 
                  el.textContent.includes('Sign in') ||
                  el.textContent.includes('Search')) {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.style.height = '0';
                el.style.overflow = 'hidden';
              }
            });

            // Remove fixed/sticky positioned elements that look like headers
            const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position: sticky"]');
            fixedElements.forEach(el => {
              const rect = el.getBoundingClientRect();
              if (rect.top <= 100 && (
                el.textContent.includes('Scribd') || 
                el.textContent.includes('Upload') || 
                el.textContent.includes('Sign in') ||
                el.textContent.includes('Search')
              )) {
                el.style.display = 'none';
              }
            });
          }

          // Run immediately and after DOM is ready
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', removeHeaders);
          } else {
            removeHeaders();
          }

          // Also run after a short delay to catch dynamically loaded content
          setTimeout(removeHeaders, 100);
          setTimeout(removeHeaders, 500);
          setTimeout(removeHeaders, 1000);
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
