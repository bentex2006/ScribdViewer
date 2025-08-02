export function validateScribdUrl(url: string): boolean {
  if (!url) return false;
  const scribdPattern = /^https:\/\/www\.scribd\.com\/document\/\d+\/.+/;
  return scribdPattern.test(url);
}

export function extractDocumentInfo(url: string): { id: string; title: string } | null {
  const match = url.match(/\/document\/(\d+)\/([^/?]+)/);
  if (!match) return null;
  
  return {
    id: match[1],
    title: match[2].replace(/-/g, ' ').toUpperCase()
  };
}
