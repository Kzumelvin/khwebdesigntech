"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Step = { title: string; hint?: string }

type Props = {
  steps: Step[]
  current: number
  onSelect: (index: number) => void
}

export function Stepper({ steps, current, onSelect }: Props) {
  return (
    <nav aria-label="Fortschritt" className="flex flex-col gap-1">
      {steps.map((step, i) => {
        const state = i < current ? "done" : i === current ? "active" : "todo"
        return (
          <button
            key={step.title}
            type="button"
            onClick={() => onSelect(i)}
            className={cn(
              "flex items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors",
              state === "active" && "bg-muted",
              state !== "active" && "hover:bg-muted/50",
            )}
            aria-current={state === "active" ? "step" : undefined}
          >
            <span
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                state === "done" && "border-primary bg-primary text-primary-foreground",
                state === "active" && "border-primary text-primary",
                state === "todo" && "border-border text-muted-foreground",
              )}
              aria-hidden="true"
            >
              {state === "done" ? <CheckIcon className="size-3.5" /> : i + 1}
            </span>
            <span className="flex flex-col">
              <span
                className={cn(
                  "text-sm font-medium leading-tight",
                  state === "todo" && "text-muted-foreground",
                )}
              >
                {step.title}
              </span>
              {step.hint && (
                <span className="text-xs text-muted-foreground">{step.hint}</span>
              )}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
