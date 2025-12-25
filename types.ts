
export enum TopologyType {
  // General Topologies
  STAR = 'Star',
  RING = 'Ring',
  BUS = 'Bus',
  MESH_FULL = 'Full Mesh',
  TREE = 'Tree',
  // Embedded Protocols
  CAN = 'CAN Bus',
  SPI = 'SPI (Serial Peripheral Interface)',
  IIC = 'I2C/IIC (Inter-Integrated Circuit)',
  USART = 'USART (Point-to-Point)'
}

export type NodeRole = 'hub' | 'standard' | 'leaf' | 'master' | 'slave' | 'node' | 'tx' | 'rx';

export interface Node {
  id: string;
  label: string;
  type: NodeRole;
}

export interface Link {
  source: string;
  target: string;
  label?: string;
}

export interface TopologyData {
  nodes: Node[];
  links: Link[];
}

export interface AIInsight {
  summary: string;
  advantages: string[];
  disadvantages: string[];
  scenarios: string[];
  reliability: string;
  technicalDetails?: string;
}
