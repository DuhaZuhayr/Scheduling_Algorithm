"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Clock, Zap, Timer, Crown } from "lucide-react"
import type { SchedulingAlgorithm, AlgorithmConfig } from "@/lib/types"
import { algorithmNames, algorithmDescriptions } from "@/lib/scheduler"

interface AlgorithmSelectorProps {
  selectedAlgorithm: SchedulingAlgorithm
  onAlgorithmChange: (algorithm: SchedulingAlgorithm) => void
  config: AlgorithmConfig
  onConfigChange: (config: AlgorithmConfig) => void
  onRunSimulation: () => void
  canRunSimulation: boolean
  isSimulating?: boolean
}

const algorithmIcons: Record<SchedulingAlgorithm, React.ReactNode> = {
  FCFS: <Clock className="w-4 h-4" />,
  RR: <Timer className="w-4 h-4" />,
  SJF: <Zap className="w-4 h-4" />,
  PRIORITY: <Crown className="w-4 h-4" />,
}

const algorithmTypes: Record<SchedulingAlgorithm, string> = {
  FCFS: "Configurable",
  RR: "Configurable",
  SJF: "Configurable",
  PRIORITY: "Configurable",
}

const algorithmComplexity: Record<SchedulingAlgorithm, "Simple" | "Medium" | "Complex"> = {
  FCFS: "Simple",
  RR: "Medium",
  SJF: "Medium",
  PRIORITY: "Medium",
}

export function AlgorithmSelector({
  selectedAlgorithm,
  onAlgorithmChange,
  config,
  onConfigChange,
  onRunSimulation,
  canRunSimulation,
  isSimulating = false,
}: AlgorithmSelectorProps) {
  const algorithms: SchedulingAlgorithm[] = ["FCFS", "RR", "SJF", "PRIORITY"]

  const handleTimeQuantumChange = (value: number[]) => {
    onConfigChange({ ...config, timeQuantum: value[0] })
  }

  // removed FB/FBV controls

  const handlePreemptiveChange = (checked: boolean) => {
    onConfigChange({ ...config, isPreemptive: checked })
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Simple":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Complex":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {algorithmIcons[selectedAlgorithm]}
          Algorithm Selection
        </CardTitle>
        <CardDescription>Choose and configure a scheduling algorithm</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Algorithm Grid */}
        <div className="grid grid-cols-1 gap-3">
          {algorithms.map((algorithm) => (
            <Button
              key={algorithm}
              variant={selectedAlgorithm === algorithm ? "default" : "outline"}
              className="justify-start text-left h-auto p-4 relative w-full whitespace-normal break-words"
              onClick={() => onAlgorithmChange(algorithm)}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="flex-shrink-0 mt-0.5">{algorithmIcons[algorithm]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium break-words">
                      {algorithmNames[algorithm]}
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {algorithmTypes[algorithm]}
                      </Badge>
                      <Badge className={`text-xs ${getComplexityColor(algorithmComplexity[algorithm])}`}>
                        {algorithmComplexity[algorithm]}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed break-words">
                    {algorithmDescriptions[algorithm]}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Algorithm Configuration */}
        <div className="pt-4 border-t space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Preemptive Mode</Label>
              <div className="text-xs text-muted-foreground">
                Allow processes to be interrupted by higher priority or newly arrived processes
              </div>
            </div>
            <Switch checked={config.isPreemptive || false} onCheckedChange={handlePreemptiveChange} />
          </div>
        </div>

        {selectedAlgorithm === "RR" && (
          <div className="pt-4 border-t space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Time Quantum</Label>
                <span className="text-sm text-muted-foreground">{config.timeQuantum || 2} units</span>
              </div>
              <Slider
                value={[config.timeQuantum || 2]}
                onValueChange={handleTimeQuantumChange}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1</span>
                <span>10</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <strong>Time Quantum:</strong> Each process gets this amount of CPU time before being preempted. Smaller
              values provide better responsiveness but higher overhead.
            </div>
          </div>
        )}

        {selectedAlgorithm === "PRIORITY" && (
          <div className="pt-4 border-t space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Priority Direction</Label>
                <div className="text-xs text-muted-foreground">
                  Choose if lower numbers or higher numbers are highest priority
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span>Max highest</span>
                <Switch
                  checked={config.priorityHighIsMin !== false}
                  onCheckedChange={(checked) => onConfigChange({ ...config, priorityHighIsMin: checked })}
                />
                <span>Min highest</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <strong>Priority Scheduling:</strong> Processes are scheduled based on their priority values. You can set
              whether lower number or higher number is considered highest priority.
              {config.isPreemptive
                ? " In preemptive mode, a higher priority process can interrupt a running lower priority process."
                : " In non-preemptive mode, once a process starts executing, it runs to completion."}
            </div>
          </div>
        )}

        {/* Algorithm Details */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Algorithm Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="outline">
                {selectedAlgorithm === "PRIORITY"
                  ? config.isPreemptive
                    ? "Preemptive"
                    : "Non-preemptive"
                  : algorithmTypes[selectedAlgorithm]}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Complexity:</span>
              <Badge className={getComplexityColor(algorithmComplexity[selectedAlgorithm])}>
                {algorithmComplexity[selectedAlgorithm]}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Best for:</span>
              <span className="text-right text-xs">
                {selectedAlgorithm === "FCFS" && "Simple batch systems"}
                {selectedAlgorithm === "RR" && "Interactive systems"}
                {selectedAlgorithm === "SJF" && "Batch systems with known job times"}
                {selectedAlgorithm === "PRIORITY" && "Systems with process importance hierarchy"}
              </span>
            </div>
          </div>
        </div>

        {/* Run Simulation Button */}
        <Button onClick={onRunSimulation} className="w-full" size="lg" disabled={!canRunSimulation || isSimulating}>
          <Timer className="w-4 h-4 mr-2" />
          {isSimulating ? "Running..." : `Run ${algorithmNames[selectedAlgorithm]} Simulation`}
        </Button>

        {!canRunSimulation && !isSimulating && (
          <p className="text-xs text-muted-foreground text-center">Add at least one process to run the simulation</p>
        )}
      </CardContent>
    </Card>
  )
}
