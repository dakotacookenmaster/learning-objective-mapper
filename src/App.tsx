import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"
import "reactflow/dist/style.css"
import "./App.css"
import {
    Node,
    Edge,
    ConnectionLineType,
    ReactFlowProvider,
    Controls,
    NodeTypes,
} from "reactflow"
import LayoutFlow from "./components/LayoutFlow"
import CourseNode from "./components/CourseNode"
import data from "./data/data.json"
import { useState } from "react"

const initialNodes: Node[] = data.courses.map((course) => ({
    id: course.code,
    type: "courseNode",
    position: { x: 0, y: 0 },
    data: {
        prerequisites: {
            and: course.prerequisites.and,
            or: course.prerequisites.or
        },
        courseCode: course.code,
        courseName: course.name,
        nondepartmental: course.nondepartmental,
        hovered: false,
        highlighted: false,
    },
}))

const initialEdges: Edge[] = data.courses.reduce(
    (accumulator: Edge[], course) => {
        if (course.prerequisites.and && course.prerequisites.and.length > 0) {
            for (const prerequisite of course.prerequisites.and) {
                accumulator.push({
                    id: `c${prerequisite}-${course.code}`,
                    source: prerequisite,
                    target: course.code,
                    type: ConnectionLineType.SmoothStep,
                    data: {
                        highlighted: false,
                    }
                })
            }
        }
        if (course.prerequisites.or && course.prerequisites.or.length > 0) {
            for (const prerequisite of course.prerequisites.or) {
                accumulator.push({
                    id: `c${prerequisite}-${course.code}`,
                    source: prerequisite,
                    target: course.code,
                    type: ConnectionLineType.SmoothStep,
                    animated: true,
                    data: {
                        highlighted: false,
                    }
                })
            }
        }
        return accumulator
    },
    [] as Edge[]
)

const nodeTypes: NodeTypes = { courseNode: CourseNode }

const App = () => {
    const [warnings, setWarnings] = useState([])
    return (
        <div style={{ width: "100vw", height: "calc(100vh - 100px)" }}>
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <h1>{ data.name }</h1>
            </div>
            <ReactFlowProvider>
                <LayoutFlow
                    nodeTypes={nodeTypes}
                    initialNodes={initialNodes}
                    initialEdges={initialEdges}
                    setWarnings={setWarnings as any}
                />
                <Controls showInteractive={false} />
            </ReactFlowProvider>
        </div>
    )
}

export default App
