"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Edit2, Check, X, Upload, Download, FileJson } from "lucide-react"
import { toast } from "sonner"
import type { Process } from "@/lib/types"

interface ProcessInputProps {
  processes: Process[]
  onProcessesChange: (processes: Process[]) => void
}

export function ProcessInput({ processes, onProcessesChange }: ProcessInputProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newProcess, setNewProcess] = useState({
    id: "",
    arrivalTime: 0,
    burstTime: 1,
    priority: 0,
  })
  const [editingProcess, setEditingProcess] = useState<Process | null>(null)

  const handleAddProcess = () => {
    if (!newProcess.id.trim()) {
      toast.error("Invalid process ID", {
        description: "Process ID cannot be empty."
      })
      return
    }

    const processExists = processes.some((p) => p.id === newProcess.id)
    if (processExists) {
      toast.error("Duplicate process ID", {
        description: `Process ${newProcess.id} already exists.`
      })
      return
    }

    if (newProcess.burstTime < 1) {
      toast.error("Invalid burst time", {
        description: "Burst time must be at least 1."
      })
      return
    }

    if (newProcess.arrivalTime < 0) {
      toast.error("Invalid arrival time", {
        description: "Arrival time cannot be negative."
      })
      return
    }

    const process: Process = {
      id: newProcess.id,
      arrivalTime: newProcess.arrivalTime,
      burstTime: Math.max(1, newProcess.burstTime),
      priority: newProcess.priority,
    }

    onProcessesChange([...processes, process])
    toast.success("Process added successfully", {
      description: `Process ${newProcess.id} has been added to the queue.`
    })
    setNewProcess({
      id: `P${processes.length + 2}`,
      arrivalTime: 0,
      burstTime: 1,
      priority: 0,
    })
  }

  const handleDeleteProcess = (id: string) => {
    onProcessesChange(processes.filter((p) => p.id !== id))
    toast.success("Process deleted", {
      description: `Process ${id} has been removed.`
    })
  }

  const handleEditStart = (process: Process) => {
    setEditingId(process.id)
    setEditingProcess({ ...process })
  }

  const handleEditSave = () => {
    if (!editingProcess) return

    const updatedProcesses = processes.map((p) =>
      p.id === editingId
        ? {
            ...editingProcess,
            burstTime: Math.max(1, editingProcess.burstTime),
          }
        : p,
    )

    onProcessesChange(updatedProcesses)
    setEditingId(null)
    setEditingProcess(null)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditingProcess(null)
  }

  const handleLoadSampleData = () => {
    const sampleProcesses: Process[] = [
      { id: "P1", arrivalTime: 0, burstTime: 5, priority: 2 },
      { id: "P2", arrivalTime: 1, burstTime: 3, priority: 1 },
      { id: "P3", arrivalTime: 2, burstTime: 8, priority: 3 },
      { id: "P4", arrivalTime: 3, burstTime: 6, priority: 1 },
      { id: "P5", arrivalTime: 4, burstTime: 2, priority: 2 },
    ]
    onProcessesChange(sampleProcesses)
    toast.success("Sample data loaded", {
      description: `${sampleProcesses.length} sample processes added.`
    })
  }

  const handleClearAll = () => {
    onProcessesChange([])
    toast.info("All processes cleared", {
      description: "The process queue is now empty."
    })
  }

  const handleExportProcesses = () => {
    const dataStr = JSON.stringify(processes, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `processes_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Processes exported", {
      description: "Process configuration has been downloaded."
    })
  }

  const handleImportProcesses = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedProcesses = JSON.parse(content) as Process[]
        
        // Validate imported data
        if (!Array.isArray(importedProcesses)) {
          throw new Error("Invalid file format")
        }

        onProcessesChange(importedProcesses)
        toast.success("Processes imported", {
          description: `${importedProcesses.length} processes loaded from file.`
        })
      } catch (error) {
        toast.error("Import failed", {
          description: "Invalid file format. Please upload a valid JSON file."
        })
      }
    }
    reader.readAsText(file)
    event.target.value = "" // Reset input
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Process Management</CardTitle>
            <CardDescription>Add, edit, or remove processes from the scheduling queue</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleLoadSampleData}>
              <FileJson className="w-3 h-3 mr-1" />
              Load Sample
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportProcesses} disabled={processes.length === 0}>
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" asChild disabled={false}>
              <label htmlFor="import-processes" className="cursor-pointer">
                <Upload className="w-3 h-3 mr-1" />
                Import
                <input
                  id="import-processes"
                  type="file"
                  accept=".json"
                  onChange={handleImportProcesses}
                  className="hidden"
                />
              </label>
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll} disabled={processes.length === 0}>
              <X className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Process */}
        <div className="border border-border rounded-lg p-4 bg-muted/50">
          <h4 className="font-medium mb-3">Add New Process</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="process-id" className="text-sm">
                Process ID
              </Label>
              <Input
                id="process-id"
                value={newProcess.id}
                onChange={(e) => setNewProcess({ ...newProcess, id: e.target.value })}
                placeholder="P1"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="arrival-time" className="text-sm">
                Arrival Time
              </Label>
              <Input
                id="arrival-time"
                type="number"
                min="0"
                value={newProcess.arrivalTime}
                onChange={(e) => setNewProcess({ ...newProcess, arrivalTime: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="burst-time" className="text-sm">
                Burst Time
              </Label>
              <Input
                id="burst-time"
                type="number"
                min="1"
                value={newProcess.burstTime}
                onChange={(e) => setNewProcess({ ...newProcess, burstTime: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddProcess} disabled={!newProcess.id.trim()} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Process
              </Button>
            </div>
          </div>
        </div>

        {/* Process List */}
        <div>
          <h4 className="font-medium mb-3">Current Processes ({processes.length})</h4>
          {processes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No processes added yet.</p>
              <p className="text-sm mt-1">Add a process above or load sample data to get started.</p>
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Process ID</th>
                      <th className="text-left p-3 font-medium">Arrival Time</th>
                      <th className="text-left p-3 font-medium">Burst Time</th>
                      <th className="text-left p-3 font-medium">Priority</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes.map((process, index) => (
                      <tr key={process.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/25"}>
                        {editingId === process.id ? (
                          <>
                            <td className="p-3 font-mono font-medium">{process.id}</td>
                            <td className="p-3">
                              <Input
                                type="number"
                                min="0"
                                value={editingProcess?.arrivalTime || 0}
                                onChange={(e) =>
                                  setEditingProcess(
                                    editingProcess ? { ...editingProcess, arrivalTime: Number(e.target.value) } : null,
                                  )
                                }
                                className="w-20"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                min="1"
                                value={editingProcess?.burstTime || 1}
                                onChange={(e) =>
                                  setEditingProcess(
                                    editingProcess ? { ...editingProcess, burstTime: Number(e.target.value) } : null,
                                  )
                                }
                                className="w-20"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                min="0"
                                value={editingProcess?.priority || 0}
                                onChange={(e) =>
                                  setEditingProcess(
                                    editingProcess ? { ...editingProcess, priority: Number(e.target.value) } : null,
                                  )
                                }
                                className="w-20"
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" onClick={handleEditSave}>
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleEditCancel}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 font-mono font-medium">{process.id}</td>
                            <td className="p-3">{process.arrivalTime}</td>
                            <td className="p-3">{process.burstTime}</td>
                            <td className="p-3">{process.priority || 0}</td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" onClick={() => handleEditStart(process)}>
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteProcess(process.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
