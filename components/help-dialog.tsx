"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle, Keyboard } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface KeyboardShortcut {
  keys: string
  description: string
  category: string
}

const shortcuts: KeyboardShortcut[] = [
  { keys: "Ctrl+Enter", description: "Run simulation", category: "General" },
  { keys: "Ctrl+L", description: "Load sample data", category: "General" },
  { keys: "Ctrl+E", description: "Export results", category: "General" },
  { keys: "Ctrl+K", description: "Show keyboard shortcuts", category: "General" },
  { keys: "Space", description: "Play/Pause animation", category: "Animation" },
  { keys: "R", description: "Reset animation", category: "Animation" },
  { keys: "←/→", description: "Step backward/forward", category: "Animation" },
]

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <HelpCircle className="w-5 h-5" />
          <span className="sr-only">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Help & Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Learn how to use the OS Scheduling Simulator efficiently
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Getting Started */}
          <div>
            <h3 className="font-semibold mb-3">Getting Started</h3>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Add processes using the "Add New Process" form or load sample data</li>
              <li>Select a scheduling algorithm from the sidebar</li>
              <li>Configure algorithm parameters (time quantum, preemption, etc.)</li>
              <li>Click "Run Simulation" to visualize the scheduling</li>
              <li>View results in the Gantt chart and performance dashboard</li>
            </ol>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Keyboard Shortcuts
            </h3>
            <div className="space-y-4">
              {["General", "Animation"].map((category) => (
                <div key={category}>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">{category}</h4>
                  <div className="space-y-2">
                    {shortcuts
                      .filter((s) => s.category === category)
                      .map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{shortcut.description}</span>
                          <Badge variant="outline" className="font-mono text-xs">
                            {shortcut.keys}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Algorithm Descriptions */}
          <div>
            <h3 className="font-semibold mb-3">Scheduling Algorithms</h3>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium">First Come First Serve (FCFS)</h4>
                <p className="text-muted-foreground">
                  Processes are executed in the order they arrive. Simple but can suffer from convoy effect.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Round Robin (RR)</h4>
                <p className="text-muted-foreground">
                  Each process gets a fixed time quantum. Fair and responsive for interactive systems.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Shortest Job First (SJF)</h4>
                <p className="text-muted-foreground">
                  Selects the process with the shortest burst time. Minimizes average waiting time.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Priority Scheduling</h4>
                <p className="text-muted-foreground">
                  Processes are scheduled based on priority values. Can be preemptive or non-preemptive.
                </p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h3 className="font-semibold mb-3">Performance Metrics</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Waiting Time:</strong>
                <span className="text-muted-foreground ml-2">Time a process spends in the ready queue</span>
              </div>
              <div>
                <strong>Turnaround Time:</strong>
                <span className="text-muted-foreground ml-2">
                  Total time from arrival to completion (waiting + burst time)
                </span>
              </div>
              <div>
                <strong>Response Time:</strong>
                <span className="text-muted-foreground ml-2">Time from arrival to first execution</span>
              </div>
              <div>
                <strong>CPU Utilization:</strong>
                <span className="text-muted-foreground ml-2">
                  Percentage of time CPU is actively executing processes
                </span>
              </div>
              <div>
                <strong>Throughput:</strong>
                <span className="text-muted-foreground ml-2">Number of processes completed per time unit</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

