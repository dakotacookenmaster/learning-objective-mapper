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
import SimpleDialog from "./components/Dialog"
import { Button } from "@mui/material"

const initialNodes: Node[] = data.courses.map((course) => ({
    id: course.code,
    type: "courseNode",
    position: { x: 0, y: 0 },
    data: {
        prerequisites: {
            and: course.prerequisites.and,
            or: course.prerequisites.or,
        },
        courseCode: course.code,
        courseName: course.name,
        nondepartmental: course.nondepartmental,
        testingRequirement: course.testingRequirement,
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
                    },
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
                    },
                })
            }
        }
        return accumulator
    },
    [] as Edge[]
)

const nodeTypes: NodeTypes = { courseNode: CourseNode }

const App = () => {
    const [warnings, setWarnings] = useState({})
    const [isOpen, setIsOpen] = useState(true)
    return (
        <div style={{ width: "100vw", height: "calc(100vh - 100px)" }}>
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0px 20px",
                    boxSizing: "border-box",
                    gap: "10px"
                }}
            >
                <h1>{data.name}</h1>
                <Button sx={{ display: "flex", gap: "10px", alignItems: "center" }} variant="contained" onClick={() => setIsOpen(true)}>View Warnings <div className="count">{ Object.entries(warnings).length }</div></Button>
            </div>
            <SimpleDialog
                warnings={warnings}
                open={isOpen}
                handleClose={() => setIsOpen(false)}
            />
            <ReactFlowProvider>
                <LayoutFlow
                    nodeTypes={nodeTypes}
                    initialNodes={initialNodes}
                    initialEdges={initialEdges}
                    setWarnings={setWarnings}
                />
                <Controls showInteractive={false} />
            </ReactFlowProvider>
        </div>
    )
}

export default App
