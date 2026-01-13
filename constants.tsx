
import { ServerNode } from './types';

export const SERVER_NODES: ServerNode[] = [
  { id: 'us-east-1', name: 'Phoenix-Alpha', region: 'North America', status: 'online', load: 45 },
  { id: 'eu-west-1', name: 'Berlin-Beta', region: 'Europe', status: 'online', load: 12 },
  { id: 'ap-southeast-1', name: 'Singapore-Gamma', region: 'Asia Pacific', status: 'online', load: 88 },
  { id: 'br-south-1', name: 'Sao-Paulo-Delta', region: 'South America', status: 'busy', load: 95 },
  { id: 'jp-tokyo-1', name: 'Tokyo-Epsilon', region: 'East Asia', status: 'online', load: 22 },
];

export const VIEW_PRESETS = [500, 1000, 5000, 10000];
