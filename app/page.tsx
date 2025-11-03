"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProcessInput } from "@/components/process-input"
import { AlgorithmSelector } from "@/components/algorithm-selector"
import { GanttChart } from "@/components/gantt-chart"
import { ResultsDashboard } from "@/components/results-dashboard"
import { AlgorithmComparison } from "@/components/algorithm-comparison"
import { QueueAnimationComponent } from "@/components/queue-animation"
import { ThemeToggle } from "@/components/theme-toggle"
import { HelpDialog } from "@/components/help-dialog"
import { toast } from "sonner"
import { Cpu, Github, BookOpen, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import type { Process, SchedulingAlgorithm, SchedulingResult, AlgorithmConfig, QueueAnimation } from "@/lib/types"
import { runSchedulingAlgorithm, algorithmNames, generateQueueAnimation } from "@/lib/scheduler"

export default function OSSchedulerPage() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SchedulingAlgorithm>("FCFS")
  const [processes, setProcesses] = useState<Process[]>([
    { id: "P1", arrivalTime: 0, burstTime: 5, priority: 2 },
    { id: "P2", arrivalTime: 1, burstTime: 3, priority: 1 },
    { id: "P3", arrivalTime: 2, burstTime: 8, priority: 3 },
    { id: "P4", arrivalTime: 3, burstTime: 6, priority: 1 },
  ])
  const [result, setResult] = useState<SchedulingResult | null>(null)
  const [queueAnimation, setQueueAnimation] = useState<QueueAnimation | null>(null)
  const [config, setConfig] = useState<AlgorithmConfig>({
    timeQuantum: 2,
    isPreemptive: false,
    priorityHighIsMin: true,
  })
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false)
  const [currentAnimationTime, setCurrentAnimationTime] = useState(0)
  const [isSimulating, setIsSimulating] = useState(false)

  const handleRunSimulation = () => {
    if (processes.length === 0) {
      toast.error("No processes to simulate", {
        description: "Please add at least one process before running the simulation."
      })
      return
    }

    setIsSimulating(true)
    toast.loading("Running simulation...", { id: "simulation" })

    let algorithmConfig = {}
    if (selectedAlgorithm === "RR") {
      algorithmConfig = { timeQuantum: config.timeQuantum, isPreemptive: config.isPreemptive }
    } else if (selectedAlgorithm === "PRIORITY") {
      algorithmConfig = { isPreemptive: config.isPreemptive, priorityHighIsMin: config.priorityHighIsMin }
    } else {
      algorithmConfig = { isPreemptive: config.isPreemptive }
    }

    try {
      const schedulingResult = runSchedulingAlgorithm(selectedAlgorithm, processes, algorithmConfig)
      setResult(schedulingResult)

      const animation = generateQueueAnimation(selectedAlgorithm, processes, algorithmConfig)
      setQueueAnimation(animation)
      setCurrentAnimationTime(0)
      setIsAnimationPlaying(false)

      toast.success("Simulation completed successfully!", {
        id: "simulation",
        description: `${algorithmNames[selectedAlgorithm]} executed with ${processes.length} processes.`
      })
    } catch (error) {
      toast.error("Simulation failed", {
        id: "simulation",
        description: error instanceof Error ? error.message : "An unexpected error occurred."
      })
      console.error("Simulation error:", error)
    } finally {
      setIsSimulating(false)
    }
  }

  const handleAnimationPlayPause = () => {
    setIsAnimationPlaying(!isAnimationPlaying)
  }

  const handleAnimationReset = () => {
    setCurrentAnimationTime(0)
    setIsAnimationPlaying(false)
  }

  const handleAnimationTimeChange = (time: number) => {
    setCurrentAnimationTime(time)
  }

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "Enter",
      ctrl: true,
      callback: handleRunSimulation,
      description: "Run simulation",
    },
    {
      key: "k",
      ctrl: true,
      callback: () => toast.info("Keyboard shortcuts", { description: "Press ? to view all shortcuts" }),
      description: "Show keyboard shortcuts",
    },
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                <Cpu className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold text-foreground flex items-center gap-2">
                  <span className="truncate">OS Scheduler</span>
                  <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                    v2.0
                  </Badge>
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5 hidden sm:block">
                  Interactive CPU scheduling algorithm visualization
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Button variant="ghost" size="sm" asChild className="hidden lg:flex">
                <a href="https://github.com/DuhaZuhayr/Scheduling_Algorithm" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Docs
                </a>
              </Button>
              <HelpDialog />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 md:px-4 py-6 md:py-8">
        <Tabs defaultValue="simulation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simulation" className="text-xs md:text-sm">
              <span className="hidden sm:inline">Single Algorithm </span>Simulation
            </TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs md:text-sm">
              <span className="hidden sm:inline">Algorithm </span>Comparison
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simulation" className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Algorithm Selection */}
              <div className="lg:col-span-1">
                <AlgorithmSelector
                  selectedAlgorithm={selectedAlgorithm}
                  onAlgorithmChange={setSelectedAlgorithm}
                  config={config}
                  onConfigChange={setConfig}
                  onRunSimulation={handleRunSimulation}
                  canRunSimulation={processes.length > 0}
                  isSimulating={isSimulating}
                />
              </div>

              {/* Process Input and Results */}
              <div className="lg:col-span-3 space-y-4 md:space-y-6">
                {/* Process Input Component */}
                <ProcessInput processes={processes} onProcessesChange={setProcesses} />

                {/* Results */}
                {result && (
                  <>
                    <ResultsDashboard
                      result={result}
                      algorithmName={algorithmNames[selectedAlgorithm]}
                      selectedAlgorithm={selectedAlgorithm}
                    />

                    <Tabs defaultValue="gantt" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
                        <TabsTrigger value="queue">Queue Animation</TabsTrigger>
                      </TabsList>

                      <TabsContent value="gantt">
                        <GanttChart
                          ganttChart={result.ganttChart}
                          processes={result.processes}
                          totalTime={result.totalTime}
                          algorithmName={algorithmNames[selectedAlgorithm]}
                        />
                      </TabsContent>

                      <TabsContent value="queue">
                        {queueAnimation && (
                          <QueueAnimationComponent
                            animation={queueAnimation}
                            isPlaying={isAnimationPlaying}
                            onPlayPause={handleAnimationPlayPause}
                            onReset={handleAnimationReset}
                            onTimeChange={handleAnimationTimeChange}
                          />
                        )}
                      </TabsContent>
                    </Tabs>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <div className="space-y-6">
              {/* Process Input */}
              <ProcessInput processes={processes} onProcessesChange={setProcesses} />

              {/* Algorithm Comparison */}
              <AlgorithmComparison processes={processes} config={config} />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">OS Scheduling Simulator</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                An interactive educational tool for understanding CPU scheduling algorithms through visual simulations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Multiple scheduling algorithms</li>
                <li>• Real-time Gantt chart visualization</li>
                <li>• Performance metrics dashboard</li>
                <li>• Algorithm comparison tools</li>
                <li>• Export results (JSON/CSV)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="https://github.com/DuhaZuhayr/Scheduling_Algorithm" className="text-muted-foreground hover:text-foreground transition-colors">
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} OS Scheduling Simulator. Built for educational purposes.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
