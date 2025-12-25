
import { TopologyType, TopologyData, Node, Link, NodeRole } from "../types";

export const generateTopology = (type: TopologyType, count: number): TopologyData => {
  const nodes: Node[] = [];
  const links: Link[] = [];

  // Helper to create basic nodes
  const createNodes = (n: number, defaultRole: NodeRole = 'node') => {
    for (let i = 0; i < n; i++) {
      nodes.push({
        id: `node-${i}`,
        label: `Node ${i + 1}`,
        type: defaultRole
      });
    }
  };

  switch (type) {
    case TopologyType.STAR:
      createNodes(count);
      nodes[0].type = 'hub';
      nodes[0].label = 'Hub/Switch';
      for (let i = 1; i < count; i++) {
        links.push({ source: nodes[0].id, target: nodes[i].id });
      }
      break;

    case TopologyType.RING:
      createNodes(count);
      for (let i = 0; i < count; i++) {
        links.push({ source: nodes[i].id, target: nodes[(i + 1) % count].id });
      }
      break;

    case TopologyType.BUS:
    case TopologyType.CAN:
      createNodes(count, 'node');
      // CAN is essentially a shared bus with terminators
      nodes[0].label = "Node (Terminator)";
      nodes[count - 1].label = `Node (Terminator)`;
      for (let i = 0; i < count - 1; i++) {
        links.push({ source: nodes[i].id, target: nodes[i + 1].id });
      }
      break;

    case TopologyType.SPI:
      createNodes(count);
      nodes[0].type = 'master';
      nodes[0].label = 'Master (MCU)';
      for (let i = 1; i < count; i++) {
        nodes[i].type = 'slave';
        nodes[i].label = `Slave ${i}`;
        // In SPI, Master connects to each slave (SS/CS lines + shared MOSI/MISO/SCK)
        links.push({ source: nodes[0].id, target: nodes[i].id });
      }
      break;

    case TopologyType.IIC:
      createNodes(count);
      nodes[0].type = 'master';
      nodes[0].label = 'Master (SDA/SCL)';
      for (let i = 1; i < count; i++) {
        nodes[i].type = 'slave';
        nodes[i].label = `Device ${i}`;
      }
      // IIC is a bus, we'll simulate it linearly or as a star for visualization
      for (let i = 0; i < count - 1; i++) {
        links.push({ source: nodes[i].id, target: nodes[i+1].id });
      }
      break;

    case TopologyType.USART:
      // USART is usually P2P, we force 2 nodes if count > 2 for clarity or handle as a pair
      const usartCount = Math.max(2, count > 2 ? 2 : count);
      for (let i = 0; i < usartCount; i++) {
        nodes.push({
          id: `node-${i}`,
          label: i === 0 ? 'TX Device' : 'RX Device',
          type: i === 0 ? 'tx' : 'rx'
        });
      }
      if (usartCount === 2) {
        links.push({ source: nodes[0].id, target: nodes[1].id });
        links.push({ source: nodes[1].id, target: nodes[0].id }); // Full Duplex
      }
      break;

    case TopologyType.MESH_FULL:
      createNodes(count);
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          links.push({ source: nodes[i].id, target: nodes[j].id });
        }
      }
      break;

    case TopologyType.TREE:
      createNodes(count);
      for (let i = 0; i < count; i++) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < count) links.push({ source: nodes[i].id, target: nodes[left].id });
        if (right < count) links.push({ source: nodes[i].id, target: nodes[right].id });
      }
      break;

    default:
      createNodes(count);
      break;
  }

  return { nodes, links };
};
