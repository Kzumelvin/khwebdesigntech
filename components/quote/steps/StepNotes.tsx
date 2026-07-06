"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import type { QuoteAction } from "../state"

type Props = {
  notes: string
  dispatch: React.Dispatch<QuoteAction>
}

export function StepNotes({ notes, dispatch }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-xl font-semibold">Notizen</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Wichtigste Punkte, Bauchgefühl, vereinbarte nächste Schritte. Landet nur in deiner Übersicht.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Gesprächsnotizen</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => dispatch({ type: "SET_NOTES", value: e.target.value })}
          rows={10}
          className="min-h-40 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          placeholder="- Kunde legt Wert auf schnelle Ladezeiten&#10;- Content wird vom Kunden geliefert&#10;- Entscheidung bis KW 24"
        />
      </div>
    </div>
  )
}
