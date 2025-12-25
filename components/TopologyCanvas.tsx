
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TopologyData, Node, Link, NodeRole } from '../types';

interface Props {
  data: TopologyData;
}

const getNodeColor = (type: NodeRole): string => {
  switch (type) {
    case 'master': return "#f59e0b"; // Amber for Master
    case 'hub': return "#3b82f6";    // Blue for Hub
    case 'slave': return "#10b981";  // Emerald for Slave
    case 'tx': return "#ec4899";     // Pink for TX
    case 'rx': return "#8b5cf6";     // Violet for RX
    case 'leaf': return "#6366f1";   // Indigo for Leaf
    default: return "#64748b";       // Slate for Standard Node
  }
};

const TopologyCanvas: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Simulation setup
    const simulation = d3.forceSimulation<any>(data.nodes)
      .force("link", d3.forceLink<any, any>(data.links).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    // Links
    const link = g.append("g")
      .attr("stroke", "#475569")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", 2)
      .selectAll("line")
      .data(data.links)
      .enter().append("line")
      .attr("stroke-dasharray", (d: any) => d.label ? "4,4" : "0");

    // Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(data.nodes)
      .enter().append("g")
      .call(d3.drag<any, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    node.append("circle")
      .attr("r", (d: any) => ['master', 'hub'].includes(d.type) ? 20 : 14)
      .attr("fill", (d: any) => getNodeColor(d.type))
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .attr("class", "transition-all duration-300 hover:brightness-125 cursor-pointer shadow-xl");

    // Labels for nodes
    node.append("text")
      .text((d: any) => d.label)
      .attr("y", (d: any) => ['master', 'hub'].includes(d.type) ? 32 : 26)
      .attr("text-anchor", "middle")
      .attr("fill", "#f1f5f9")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("style", "text-shadow: 0 1px 2px rgba(0,0,0,0.8);");

    // Sub-label for roles
    node.append("text")
      .text((d: any) => d.type.toUpperCase())
      .attr("y", (d: any) => ['master', 'hub'].includes(d.type) ? 44 : 38)
      .attr("text-anchor", "middle")
      .attr("fill", "#94a3b8")
      .attr("font-size", "8px")
      .attr("font-weight", "700");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    const resizeObserver = new ResizeObserver(() => {
        if (!svgRef.current) return;
        const newWidth = svgRef.current.clientWidth;
        const newHeight = svgRef.current.clientHeight;
        simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
        simulation.alpha(0.1).restart();
    });
    resizeObserver.observe(svgRef.current);

    return () => {
        simulation.stop();
        resizeObserver.disconnect();
    };
  }, [data]);

  return (
    <div className="relative w-full h-full bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="px-3 py-1.5 bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 uppercase tracking-tighter shadow-lg">
           交互说明: 拖拽节点 | 滚动缩放
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold">
             <div className="w-2 h-2 rounded-full bg-amber-500"></div> Master
           </div>
           <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold">
             <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Slave
           </div>
           <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold">
             <div className="w-2 h-2 rounded-full bg-blue-500"></div> Hub/Node
           </div>
        </div>
      </div>
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};

export default TopologyCanvas;
