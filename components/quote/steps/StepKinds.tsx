"use client"

import * as React from "react"
import { GlobeIcon, VideoIcon, RefreshCwIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { QuoteAction, QuoteState, ServiceKind } from "../state"

type Props = {
  kinds: QuoteState["kinds"]
  dispatch: React.Dispatch<QuoteAction>
}

const OPTIONS: { kind: ServiceKind; title: string; hint: string; icon: React.ReactNode }[] = [
  {
    kind: "website",
    title: "Website",
    hint: "One-Pager, mehrseitig, Shop, Web-App",
    icon: <GlobeIcon className="size-5" />,
  },
  {
    kind: "media",
    title: "Werbeproduktion",
    hint: "Video, Foto, Grafik, Print",
    icon: <VideoIcon className="size-5" />,
  },
  {
    kind: "recurring",
    title: "Laufende Leistungen",
    hint: "Hosting, Wartung, Content-Pflege, Support",
    icon: <RefreshCwIcon className="size-5" />,
  },
]

export function StepKinds({ kinds, dispatch }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-xl font-semibold">Welche Leistungen sind Thema?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Mehrfachauswahl möglich – nur ausgewählte Bereiche werden in den folgenden Schritten
          abgefragt.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((opt) => {
          const active = kinds[opt.kind]
          return (
            <button
              key={opt.kind}
              type="button"
              onClick={() => dispatch({ type: "TOGGLE_KIND", kind: opt.kind })}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
                active
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-foreground/30 hover:bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                )}
              >
                {opt.icon}
              </span>
              <span className="text-base font-semibold">{opt.title}</span>
              <span className="text-xs text-muted-foreground">{opt.hint}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
