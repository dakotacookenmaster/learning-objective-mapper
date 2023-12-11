import { useCallback } from "react"
import { Handle, NodeProps, Position, useReactFlow } from "reactflow"

const CourseNode = (props: NodeProps) => {
    const { data, id } = props
    const { getNode, setNodes, setEdges } = useReactFlow()
    const nodeStyle: React.CSSProperties | object = {
        padding: "10px 20px",
        background: data.nondepartmental ? "#5072A7" : data.testingRequirement ? "#ff80ff" : "white",
        borderRadius: "3px",
        display: "flex",
        gap: "5px",
        flexDirection: "column",
        alignItems: "center",
        minWidth: "250px",
        outline: data.highlighted || data.hovered ? "5px solid orange" : undefined,
    }

    const handleMouseAction = useCallback(
        (nodeId: string, hovered: boolean) => {
            setNodes((prevNodes) => {
                return prevNodes.map((node) => {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            hovered: false,
                            highlighted: false,
                        },
                    }
                })
            })
            const existingNode = getNode(nodeId)!
            const prerequisites: string[] = []
            if (existingNode.data.prerequisites.and) {
                prerequisites.push(...existingNode.data.prerequisites.and)
            }
            if (existingNode.data.prerequisites.or) {
                prerequisites.push(...existingNode.data.prerequisites.or)
            }
            setNodes((prevNodes) => {
                return prevNodes.map((node) => {
                    if (node.id === nodeId) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                hovered,
                            },
                        }
                    } else if (prerequisites.includes(node.id)) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                highlighted: hovered,
                            },
                        }
                    }
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            highlighted: false,
                            hovered: false,
                        },
                    }
                })
            })
            setEdges((prevEdges) => {
                return prevEdges.map((edge) => {
                    if (edge.id.includes(`-${nodeId}`)) {
                        return {
                            ...edge,
                            data: {
                                ...edge.data,
                                highlighted: hovered,
                            },
                            style: {
                                stroke: hovered ? "orange" : undefined,
                                strokeWidth: hovered ? "6px" : "1px",
                            },
                        }
                    }
                    return {
                        ...edge,
                        data: {
                            ...edge.data,
                            highlighted: false,
                        },
                        style: {
                            stroke: undefined,
                            strokeWidth: "1px",
                        },
                    }
                })
            })
        },
        [getNode, setEdges, setNodes]
    )

    return (
        <div
            onMouseOver={() => handleMouseAction(id, true)}
            onMouseOut={() => handleMouseAction(id, false)}
            className={`courseNode`}
        >
            <Handle
                isConnectable={false}
                type="target"
                position={Position.Left}
            />
            <div style={nodeStyle} className={`${(data.hovered || data.highlighted) ? "selected" : ""}`}>
                <span style={{ fontWeight: "bold", color: data.nondepartmental || data.testingRequirement ? "white" : undefined }} className="courseName">{data.courseName}</span>
                <span style={{ fontWeight: "bold", color: data.nondepartmental || data.testingRequirement ? "white" : undefined }} className="courseCode">{data.courseCode}</span>
            </div>
            <Handle
                isConnectable={false}
                type="source"
                position={Position.Right}
            />
        </div>
    )
}

export default CourseNode
