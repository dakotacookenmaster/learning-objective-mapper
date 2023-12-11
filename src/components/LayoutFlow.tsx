import { useCallback, useEffect, useLayoutEffect, useRef } from "react"
import ReactFlow, {
    useReactFlow,
    useNodesState,
    useEdgesState,
    Edge,
    Node,
    NodeTypes,
} from "reactflow"
import Dagre from "@dagrejs/dagre"

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))

const getLayoutedElements = (
    nodes: Node[],
    edges: Edge[],
    options: { direction: string }
) => {
    g.setGraph({ rankdir: options.direction })

    edges.forEach((edge) => g.setEdge(edge.source, edge.target))
    nodes.forEach((node) =>
        g.setNode(node.id, {
            width: node.width as number,
            height: node.height as number,
        })
    )

    Dagre.layout(g)

    return {
        nodes: nodes.map((node) => {
            const { x, y } = g.node(node.id)
            return { ...node, position: { x, y } }
        }),
        edges,
    }
}

const LayoutFlow = (props: {
    nodeTypes: NodeTypes
    initialNodes: Node[]
    initialEdges: Edge[]
    setWarnings: React.Dispatch<React.SetStateAction<{}>>
}) => {
    const { initialNodes, initialEdges, nodeTypes, setWarnings } = props
    const { fitView } = useReactFlow()
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
    const hasRendered = useRef(false)

    const onLayout = useCallback(
        (direction: "TB" | "LR") => {
            const layouted = getLayoutedElements(nodes, edges, { direction })

            setNodes([...layouted.nodes])
            setEdges([...layouted.edges])

            window.requestAnimationFrame(() => {
                fitView()
            })
        },
        [nodes, edges, setNodes, setEdges, fitView]
    )

    useLayoutEffect(() => {
        if (!hasRendered.current && nodes.length && nodes[0].width) {
            hasRendered.current = true
            onLayout("LR")
        }
    }, [nodes, onLayout])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type CourseNode = {
        data: {
            courseCode: string
            prerequisites: {
                and: string[] | undefined
                or: string[] | undefined
            }
        }
    }
    const getPrerequisites = useCallback(
        (course: CourseNode, paths: string[][] = [[]]): string[][] => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (course.data.prerequisites.and) {
                const lastPath = paths[paths.length - 1]
                for (const prereq of course.data.prerequisites.and) {
                    const node = nodes.find((node) => node.id === prereq)
                    lastPath.push(...course.data.prerequisites.and)
                    getPrerequisites(node as CourseNode, paths)
                }
            }

            if (course.data.prerequisites.or) {
                const lastPath = paths.splice(paths.length - 1, 1)[0]
                for (const prereq of course.data.prerequisites.or) {
                    const node = nodes.find((node) => node.id === prereq)
                    paths.push([...lastPath, prereq])
                    getPrerequisites(node as CourseNode, paths)
                }
            }
            return paths.map((p) => Array.from(new Set(p)))
        },
        [nodes]
    )

    useEffect(() => {
        // check if a node is a departmental class, check its dependenies
        // and see if all of its dependencies are non-departmental
        const departmentalCourses = nodes.filter(
            (node) => !node.data.nondepartmental
        )
        const warnings = {} as any
        const nondepartmentalCourses = nodes.filter(
            (node) => node.data.nondepartmental
        )

        for (let course of departmentalCourses) {
            const paths = getPrerequisites(course as CourseNode).map((path) =>
                path.reverse()
            )

            for (let i = 0; i < paths.length; i++) {
                // loop over each path
                let length = paths[i].length
                let found = 0
                for (let j = 0; j < paths[i].length; j++) {
                    // loop over each courseCode
                    if (
                        nondepartmentalCourses.find(
                            (c) => c.data.courseCode === paths[i][j]
                        )
                    ) {
                        found++
                    }
                }
                if (length && found && length === found) {
                    if(warnings[course.data.courseCode]) {
                        warnings[course.data.courseCode] = {
                            ...warnings[course.data.courseCode],
                            message: `Warning: ${course.data.courseCode} has one or more prerequisite path which are completely nondepartmental.`,
                            paths: [...warnings[course.data.courseCode].paths as string[], paths[i]],
                        }
                    }
                    warnings[course.data.courseCode] = {
                        message: `Warning: ${course.data.courseCode} has one or more prerequisite paths which are completely nondepartmental.`,
                        paths: [paths[i]],
                    }
                }
            }
            setWarnings((prevWarnings) => {
                return {
                    ...prevWarnings,
                    ...warnings,
                }
            })
        }
    }, [nodes, getPrerequisites])

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            style={{
                opacity: hasRendered.current ? 1 : 0,
            }}
            fitView
        />
    )
}

export default LayoutFlow
