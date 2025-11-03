"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Download, TrendingUp, TrendingDown, Minus, Clock, Zap, Timer, FileText } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { SchedulingResult } from "@/lib/types"

interface ResultsDashboardProps {
  result: SchedulingResult
  algorithmName: string
  selectedAlgorithm: string
}

export function ResultsDashboard({ result, algorithmName, selectedAlgorithm }: ResultsDashboardProps) {
  // Calculate additional metrics
  const totalIdleTime = result.ganttChart
    .filter((item) => item.isIdle)
    .reduce((sum, item) => sum + (item.endTime - item.startTime), 0)

  const cpuUtilization = ((result.totalTime - totalIdleTime) / result.totalTime) * 100
  const throughput = result.processes.length / result.totalTime

  // Find best and worst performing processes
  const sortedByWaiting = [...result.processes].sort((a, b) => (a.waitingTime || 0) - (b.waitingTime || 0))
  const bestProcess = sortedByWaiting[0]
  const worstProcess = sortedByWaiting[sortedByWaiting.length - 1]

  // Prepare chart data
  const processChartData = result.processes.map((process) => ({
    name: process.id,
    waiting: process.waitingTime || 0,
    turnaround: process.turnaroundTime || 0,
    response: process.responseTime || 0,
    burst: process.burstTime,
  }))

  const metricsData = [
    { name: "Waiting", value: result.averageWaitingTime, color: "#ef4444" },
    { name: "Turnaround", value: result.averageTurnaroundTime, color: "#f59e0b" },
    { name: "Response", value: result.averageResponseTime, color: "#10b981" },
  ]

  const getPerformanceRating = (metric: number, type: "time" | "utilization") => {
    if (type === "utilization") {
      if (metric >= 90) return { rating: "Excellent", color: "text-green-600", icon: TrendingUp }
      if (metric >= 75) return { rating: "Good", color: "text-blue-600", icon: TrendingUp }
      if (metric >= 60) return { rating: "Fair", color: "text-yellow-600", icon: Minus }
      return { rating: "Poor", color: "text-red-600", icon: TrendingDown }
    } else {
      if (metric <= 2) return { rating: "Excellent", color: "text-green-600", icon: TrendingUp }
      if (metric <= 5) return { rating: "Good", color: "text-blue-600", icon: TrendingUp }
      if (metric <= 10) return { rating: "Fair", color: "text-yellow-600", icon: Minus }
      return { rating: "Poor", color: "text-red-600", icon: TrendingDown }
    }
  }

  const utilizationRating = getPerformanceRating(cpuUtilization, "utilization")
  const waitingRating = getPerformanceRating(result.averageWaitingTime, "time")
  const responseRating = getPerformanceRating(result.averageResponseTime, "time")

  const handleExportJSON = () => {
    const exportData = {
      algorithm: algorithmName,
      timestamp: new Date().toISOString(),
      metrics: {
        averageWaitingTime: result.averageWaitingTime,
        averageTurnaroundTime: result.averageTurnaroundTime,
        averageResponseTime: result.averageResponseTime,
        cpuUtilization: cpuUtilization,
        throughput: throughput,
        totalTime: result.totalTime,
      },
      processes: result.processes,
      ganttChart: result.ganttChart,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedAlgorithm}_results_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Results exported as JSON")
  }

  const handleExportCSV = () => {
    const headers = ["Process ID", "Arrival Time", "Burst Time", "Priority", "Waiting Time", "Turnaround Time", "Response Time", "Completion Time"]
    const rows = result.processes.map((p) => [
      p.id,
      p.arrivalTime,
      p.burstTime,
      p.priority || 0,
      p.waitingTime || 0,
      p.turnaroundTime || 0,
      p.responseTime || 0,
      p.completionTime || 0,
    ])

    const csvContent = [
      `Algorithm: ${algorithmName}`,
      `Timestamp: ${new Date().toISOString()}`,
      `Average Waiting Time: ${result.averageWaitingTime.toFixed(2)}`,
      `Average Turnaround Time: ${result.averageTurnaroundTime.toFixed(2)}`,
      `Average Response Time: ${result.averageResponseTime.toFixed(2)}`,
      `CPU Utilization: ${cpuUtilization.toFixed(2)}%`,
      `Throughput: ${throughput.toFixed(2)}`,
      "",
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedAlgorithm}_results_${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Results exported as CSV")
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance Dashboard</CardTitle>
              <CardDescription>{algorithmName} scheduling analysis and insights</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportJSON}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CPU Utilization */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">CPU Utilization</span>
                </div>
                <utilizationRating.icon className={`w-4 h-4 ${utilizationRating.color}`} />
              </div>
              <div className="text-2xl font-bold mb-1">{cpuUtilization.toFixed(1)}%</div>
              <Progress value={cpuUtilization} className="mb-2" />
              <Badge variant="secondary" className={utilizationRating.color}>
                {utilizationRating.rating}
              </Badge>
            </div>

            {/* Throughput */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Throughput</span>
              </div>
              <div className="text-2xl font-bold mb-1">{throughput.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">processes/time unit</div>
            </div>

            {/* Average Waiting Time */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Avg Waiting</span>
                </div>
                <waitingRating.icon className={`w-4 h-4 ${waitingRating.color}`} />
              </div>
              <div className="text-2xl font-bold mb-1">{result.averageWaitingTime.toFixed(2)}</div>
              <Badge variant="secondary" className={waitingRating.color}>
                {waitingRating.rating}
              </Badge>
            </div>

            {/* Average Response Time */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Avg Response</span>
                </div>
                <responseRating.icon className={`w-4 h-4 ${responseRating.color}`} />
              </div>
              <div className="text-2xl font-bold mb-1">{result.averageResponseTime.toFixed(2)}</div>
              <Badge variant="secondary" className={responseRating.color}>
                {responseRating.rating}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Process Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Process Performance Comparison</CardTitle>
            <CardDescription>Waiting, turnaround, and response times by process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="waiting" fill="#ef4444" name="Waiting Time" />
                  <Bar dataKey="turnaround" fill="#f59e0b" name="Turnaround Time" />
                  <Bar dataKey="response" fill="#10b981" name="Response Time" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Average Metrics Distribution</CardTitle>
            <CardDescription>Breakdown of average scheduling metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metricsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${typeof value === "number" ? value.toFixed(1) : value}`}
                  >
                    {metricsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Process Analysis</CardTitle>
          <CardDescription>Individual process performance insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best Performer */}
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Best Performer</span>
              </div>
              <div className="space-y-2">
                <div className="font-mono font-bold text-lg">{bestProcess.id}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Waiting: {bestProcess.waitingTime}</div>
                  <div>Turnaround: {bestProcess.turnaroundTime}</div>
                  <div>Response: {bestProcess.responseTime}</div>
                  <div>Burst: {bestProcess.burstTime}</div>
                </div>
              </div>
            </div>

            {/* Worst Performer */}
            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-800 dark:text-red-200">Needs Attention</span>
              </div>
              <div className="space-y-2">
                <div className="font-mono font-bold text-lg">{worstProcess.id}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Waiting: {worstProcess.waitingTime}</div>
                  <div>Turnaround: {worstProcess.turnaroundTime}</div>
                  <div>Response: {worstProcess.responseTime}</div>
                  <div>Burst: {worstProcess.burstTime}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Algorithm Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Insights</CardTitle>
          <CardDescription>Key characteristics and recommendations for {algorithmName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedAlgorithm === "FCFS" && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium mb-2">FCFS Characteristics</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Simple and fair - processes are served in arrival order</li>
                  <li>• No preemption - once started, process runs to completion</li>
                  <li>• Can suffer from convoy effect with long processes</li>
                  <li>• Best for batch systems with predictable workloads</li>
                </ul>
              </div>
            )}

            {selectedAlgorithm === "RR" && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium mb-2">Round Robin Characteristics</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Fair time sharing with preemption</li>
                  <li>• Good responsiveness for interactive systems</li>
                  <li>• Time quantum affects performance - smaller = more responsive but higher overhead</li>
                  <li>• Ideal for time-sharing and interactive environments</li>
                </ul>
              </div>
            )}

            {selectedAlgorithm === "SPN" && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium mb-2">Shortest Process Next Characteristics</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Minimizes average waiting time</li>
                  <li>• Can cause starvation of longer processes</li>
                  <li>• Requires knowledge of process execution times</li>
                  <li>• Best for batch systems with known job characteristics</li>
                </ul>
              </div>
            )}

            {selectedAlgorithm === "SRT" && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium mb-2">Shortest Remaining Time Characteristics</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Preemptive version of SPN</li>
                  <li>• Optimal for minimizing average waiting time</li>
                  <li>• High context switching overhead</li>
                  <li>• Good for systems with varying process sizes</li>
                </ul>
              </div>
            )}

            {(selectedAlgorithm === "FB" || selectedAlgorithm === "FBV") && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium mb-2">Feedback Scheduling Characteristics</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Multi-level priority queues with aging</li>
                  <li>• Favors shorter processes and interactive jobs</li>
                  <li>• Automatically adjusts to process behavior</li>
                  <li>• Excellent for general-purpose systems with mixed workloads</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
