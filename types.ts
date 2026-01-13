
export enum BoostStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ServerNode {
  id: string;
  name: string;
  region: string;
  status: 'online' | 'busy' | 'offline';
  load: number;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface ViralAnalysis {
  score: number;
  recommendations: string[];
  estimatedReach: string;
}
