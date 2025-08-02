import { HistoryItem, InsertHistoryItem } from "@shared/schema";

// Storage interface with history management
export interface IStorage {
  addToHistory(item: InsertHistoryItem): Promise<HistoryItem>;
  getHistory(): Promise<HistoryItem[]>;
  clearHistory(): Promise<void>;
  removeFromHistory(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private history: Map<string, HistoryItem>;

  constructor() {
    this.history = new Map();
  }

  async addToHistory(item: InsertHistoryItem): Promise<HistoryItem> {
    const historyItem: HistoryItem = {
      ...item,
      viewedAt: item.viewedAt || new Date(),
    };
    
    this.history.set(item.id, historyItem);
    return historyItem;
  }

  async getHistory(): Promise<HistoryItem[]> {
    return Array.from(this.history.values()).sort(
      (a, b) => b.viewedAt.getTime() - a.viewedAt.getTime()
    );
  }

  async clearHistory(): Promise<void> {
    this.history.clear();
  }

  async removeFromHistory(id: string): Promise<void> {
    this.history.delete(id);
  }
}

export const storage = new MemStorage();
