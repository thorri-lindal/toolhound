import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as d3 from 'd3'
import { buildMindmapData } from '../data/tools'
import { useTranslation } from '../i18n/LanguageContext'

const CATEGORY_COLORS = {
  'Hand Tools': '#3b82f6',
  'Power Tools': '#f97316',
  'Specialized Tools': '#a855f7',
  'Measuring & Marking': '#22c55e',
  'Fasteners & Hardware': '#ef4444',
  'Adhesives & Sealants': '#eab308',
}

function getDepthLevel(d) {
  let depth = 0
  let node = d
  while (node.parent) { depth++; node = node.parent }
  return depth
}

function getCategoryName(d) {
  let node = d
  while (node.parent && node.parent.parent) node = node.parent
  return node.data?.name
}

function getNodeColor(d) {
  const depth = getDepthLevel(d)
  if (depth === 0) return '#1e293b'
  const catName = getCategoryName(d)
  return CATEGORY_COLORS[catName] || '#94a3b8'
}

function getNodeRadius(d) {
  const depth = getDepthLevel(d)
  if (depth === 0) return 40
  if (depth === 1) return 28
  if (depth === 2) return 16
  return 8
}

// Flatten visible nodes from the hierarchy based on expanded state
function getVisibleGraph(root, expanded) {
  const nodes = []
  const links = []

  function walk(node) {
    nodes.push(node)
    const depth = getDepthLevel(node)
    const key = `${depth}-${node.data.name}`
    const isExpanded = expanded.has(key)

    if (node.children && (depth === 0 || isExpanded)) {
      node.children.forEach((child) => {
        links.push({ source: node, target: child })
        walk(child)
      })
    }
  }

  walk(root)
  return { nodes, links }
}

export default function MindmapPage() {
  const { t } = useTranslation()
  const svgRef = useRef(null)
  const simRef = useRef(null)
  const navigate = useNavigate()
  const [tooltip, setTooltip] = useState(null)
  const [search, setSearch] = useState('')
  // Start with only root expanded (categories visible)
  const [expanded, setExpanded] = useState(new Set(['0-All Tools']))

  const toggleExpand = useCallback((d) => {
    const depth = getDepthLevel(d)
    const key = `${depth}-${d.data.name}`
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        // Collapse this node and all descendants
        next.delete(key)
        const removeDescendants = (node) => {
          if (node.children) {
            node.children.forEach((child) => {
              const childKey = `${getDepthLevel(child)}-${child.data.name}`
              next.delete(childKey)
              removeDescendants(child)
            })
          }
        }
        removeDescendants(d)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  useEffect(() => {
    const container = svgRef.current?.parentElement
    if (!container) return
    const W = container.clientWidth
    const H = container.clientHeight

    const svg = d3.select(svgRef.current)
      .attr('width', W)
      .attr('height', H)

    svg.selectAll('*').remove()

    const g = svg.append('g')

    // Zoom + pan
    const zoom = d3.zoom().scaleExtent([0.2, 5]).on('zoom', (event) => {
      g.attr('transform', event.transform)
      // Store current zoom for label visibility
      g.attr('data-zoom', event.transform.k)
    })
    svg.call(zoom)
    svg.call(zoom.transform, d3.zoomIdentity.translate(W / 2, H / 2))

    // Build hierarchy
    const rawData = buildMindmapData()
    const root = d3.hierarchy(rawData)

    // Get visible nodes/links
    const { nodes, links } = getVisibleGraph(root, expanded)

    // Preserve positions from previous render
    nodes.forEach((d) => {
      if (d._fx !== undefined) { d.x = d._fx; d.y = d._fy }
    })

    // Force simulation
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.data.name).distance((d) => {
        const sourceDepth = getDepthLevel(d.source)
        if (sourceDepth === 0) return 180
        if (sourceDepth === 1) return 120
        return 70
      }).strength(0.8))
      .force('charge', d3.forceManyBody().strength((d) => {
        const depth = getDepthLevel(d)
        if (depth === 0) return -800
        if (depth === 1) return -400
        if (depth === 2) return -200
        return -80
      }))
      .force('center', d3.forceCenter(0, 0).strength(0.05))
      .force('collision', d3.forceCollide().radius((d) => getNodeRadius(d) + 8))
      .force('x', d3.forceX(0).strength(0.02))
      .force('y', d3.forceY(0).strength(0.02))
      .alphaDecay(0.03)
      .velocityDecay(0.4)

    simRef.current = sim

    // Search matching
    const q = search.toLowerCase()
    const matchSet = new Set()
    if (q) {
      nodes.forEach((d) => {
        if (d.data.name?.toLowerCase().includes(q)) {
          matchSet.add(d)
          // Highlight ancestors
          let ancestor = d.parent
          while (ancestor) { matchSet.add(ancestor); ancestor = ancestor.parent }
        }
      })
    }

    // Defs for glow filter
    const defs = svg.append('defs')
    const filter = defs.append('filter').attr('id', 'glow')
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur')
    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Links
    const linkG = g.append('g').attr('class', 'links')
    const linkSel = linkG.selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) => {
        const catName = getCategoryName(d.target)
        return CATEGORY_COLORS[catName] || '#94a3b8'
      })
      .attr('stroke-opacity', (d) => {
        if (!q) return 0.3
        return (matchSet.has(d.source) && matchSet.has(d.target)) ? 0.6 : 0.05
      })
      .attr('stroke-width', (d) => {
        const depth = getDepthLevel(d.source)
        return depth === 0 ? 3 : depth === 1 ? 2 : 1.5
      })

    // Node groups
    const nodeG = g.append('g').attr('class', 'nodes')
    const nodeSel = nodeG.selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', (d) => {
        const depth = getDepthLevel(d)
        return (depth <= 2 || d.data.id) ? 'pointer' : 'default'
      })
      .attr('opacity', (d) => {
        if (!q) return 1
        return matchSet.has(d) ? 1 : 0.12
      })
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) sim.alphaTarget(0.3).restart()
          d.fx = d.x; d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x; d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) sim.alphaTarget(0)
          d.fx = null; d.fy = null
        })
      )
      .on('click', (event, d) => {
        event.stopPropagation()
        const depth = getDepthLevel(d)
        if (d.data.id) {
          navigate(`/tool/${d.data.id}`)
        } else if (depth <= 2 && d.children) {
          toggleExpand(d)
        }
      })
      .on('mouseenter', (event, d) => {
        const depth = getDepthLevel(d)
        const hasChildren = d.children && d.children.length > 0
        const key = `${depth}-${d.data.name}`
        const isExpanded = expanded.has(key)
        const rect = svgRef.current.getBoundingClientRect()

        // Glow effect
        d3.select(event.currentTarget).select('circle').attr('filter', 'url(#glow)')

        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          name: d.data.name,
          emoji: d.data.emoji,
          description: d.data.description,
          isCollapsible: depth <= 2 && hasChildren,
          isExpanded,
          childCount: d.children ? d.children.length : (d._children ? d._children.length : 0),
          isTool: !!d.data.id,
        })
      })
      .on('mousemove', (event) => {
        const rect = svgRef.current.getBoundingClientRect()
        setTooltip((prev) => prev ? { ...prev, x: event.clientX - rect.left, y: event.clientY - rect.top } : null)
      })
      .on('mouseleave', (event) => {
        d3.select(event.currentTarget).select('circle').attr('filter', null)
        setTooltip(null)
      })

    // Node circles
    nodeSel.append('circle')
      .attr('r', (d) => getNodeRadius(d))
      .attr('fill', (d) => getNodeColor(d))
      .attr('fill-opacity', (d) => {
        const depth = getDepthLevel(d)
        return depth === 3 ? 0.8 : 1
      })
      .attr('stroke', (d) => {
        const depth = getDepthLevel(d)
        return depth === 0 ? '#f8fafc' : 'rgba(255,255,255,0.8)'
      })
      .attr('stroke-width', (d) => {
        const depth = getDepthLevel(d)
        return depth === 0 ? 4 : depth === 1 ? 3 : 2
      })

    // Count badge for collapsed nodes with children
    nodeSel.filter((d) => {
      const depth = getDepthLevel(d)
      const key = `${depth}-${d.data.name}`
      return depth <= 2 && d.children && !expanded.has(key)
    })
      .append('g')
      .attr('class', 'badge')
      .each(function (d) {
        const g = d3.select(this)
        const count = countAllDescendants(d)
        const r = getNodeRadius(d)
        g.append('circle')
          .attr('cx', r * 0.7)
          .attr('cy', -r * 0.7)
          .attr('r', 10)
          .attr('fill', '#ef4444')
          .attr('stroke', 'white')
          .attr('stroke-width', 2)
        g.append('text')
          .attr('x', r * 0.7)
          .attr('y', -r * 0.7)
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('font-size', 9)
          .attr('font-weight', '700')
          .attr('fill', 'white')
          .text(count)
      })

    // Emoji inside large nodes (root, category)
    nodeSel.filter((d) => getDepthLevel(d) === 0)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', 20)
      .attr('pointer-events', 'none')
      .text('🔧')

    // Labels
    nodeSel.append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => {
        const r = getNodeRadius(d)
        return r + 14
      })
      .attr('font-size', (d) => {
        const depth = getDepthLevel(d)
        return depth === 0 ? 14 : depth === 1 ? 12 : depth === 2 ? 10 : 9
      })
      .attr('font-weight', (d) => {
        const depth = getDepthLevel(d)
        return depth <= 1 ? '700' : depth === 2 ? '600' : '400'
      })
      .attr('fill', (d) => {
        const depth = getDepthLevel(d)
        if (depth === 0) return '#f1f5f9'
        if (depth === 3) return '#94a3b8'
        return '#cbd5e1'
      })
      .attr('paint-order', 'stroke')
      .attr('stroke', 'rgba(15,23,42,0.7)')
      .attr('stroke-width', 3)
      .text((d) => {
        const depth = getDepthLevel(d)
        if (depth === 3 && d.data.emoji) return `${d.data.emoji} ${d.data.name}`
        return d.data.name
      })

    // Tick function
    sim.on('tick', () => {
      linkSel
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

      nodeSel.attr('transform', (d) => `translate(${d.x},${d.y})`)
    })

    // Resize handler
    const ro = new ResizeObserver(() => {
      const newW = container.clientWidth
      const newH = container.clientHeight
      svg.attr('width', newW).attr('height', newH)
    })
    ro.observe(container)

    return () => {
      sim.stop()
      ro.disconnect()
    }
  }, [expanded, search, navigate, toggleExpand, t])

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Legend */}
      <div className="flex-shrink-0 px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('mindmap.title')}</span>
          {Object.entries(CATEGORY_COLORS).map(([name, color]) => (
            <span key={name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              {name}
            </span>
          ))}
        </div>
        <div className="text-xs text-slate-400">
          Click to expand · Drag nodes · Scroll to zoom
        </div>
      </div>

      {/* SVG canvas */}
      <div className="flex-1 relative overflow-hidden bg-slate-950">
        {/* Search overlay */}
        <div className="absolute top-4 left-4 z-20">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('mindmap.searchPlaceholder')}
              className="pl-9 pr-8 py-2 rounded-xl border border-slate-700 bg-slate-900/90 backdrop-blur-sm text-sm text-white shadow-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-900 w-56 placeholder-slate-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Expand/Collapse all buttons */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button
            onClick={() => {
              const data = buildMindmapData()
              const root = d3.hierarchy(data)
              const all = new Set()
              root.each((d) => {
                const depth = getDepthLevel(d)
                if (depth <= 2) all.add(`${depth}-${d.data.name}`)
              })
              setExpanded(all)
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800/90 backdrop-blur-sm border border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Expand all
          </button>
          <button
            onClick={() => setExpanded(new Set(['0-All Tools']))}
            className="px-3 py-1.5 rounded-lg bg-slate-800/90 backdrop-blur-sm border border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Collapse all
          </button>
        </div>

        <svg ref={svgRef} className="w-full h-full" />

        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full whitespace-nowrap"
            style={{ left: tooltip.x, top: tooltip.y - 16 }}
          >
            <div className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-3 rounded-xl shadow-2xl max-w-xs">
              <div className="font-semibold">
                {tooltip.emoji && <span className="mr-1">{tooltip.emoji}</span>}
                {tooltip.name}
              </div>
              {tooltip.description && (
                <p className="text-xs text-slate-400 mt-1 whitespace-normal line-clamp-2">{tooltip.description}</p>
              )}
              <div className="text-[11px] text-slate-500 mt-1.5 border-t border-slate-700 pt-1.5">
                {tooltip.isTool
                  ? 'Click to open'
                  : tooltip.isCollapsible
                    ? (tooltip.isExpanded
                        ? `Click to collapse · ${tooltip.childCount} items`
                        : `Click to expand · ${tooltip.childCount} items`)
                    : ''}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function countAllDescendants(node) {
  let count = 0
  function walk(n) {
    if (n.children) {
      n.children.forEach((c) => {
        count++
        walk(c)
      })
    }
  }
  walk(node)
  return count
}
