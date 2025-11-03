"use client"

import { useEffect } from "react"

interface KeyboardShortcut {
    key: string
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    callback: () => void
    description: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            for (const shortcut of shortcuts) {
                const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
                const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
                const altMatch = shortcut.alt ? event.altKey : !event.altKey
                const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

                if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
                    event.preventDefault()
                    shortcut.callback()
                    break
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [shortcuts])
}

export function getShortcutDisplay(shortcut: Omit<KeyboardShortcut, "callback">) {
    const parts: string[] = []
    if (shortcut.ctrl) parts.push("Ctrl")
    if (shortcut.shift) parts.push("Shift")
    if (shortcut.alt) parts.push("Alt")
    parts.push(shortcut.key.toUpperCase())
    return parts.join("+")
}

