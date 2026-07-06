"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EUR, type LineItem } from "./state"

type Props = {
  items: LineItem[]
  fix: number
  fixAfter: number
  discountAmount: number
  monthly: number
  loading: boolean
}

export function SummarySidebar({
  items,
  fix,
  fixAfter,
  discountAmount,
  monthly,
  loading,
}: Props) {
  const fixItems = items.filter((i) => i.bucket === "fix")
  const monthItems = items.filter((i) => i.bucket === "monthly")

  return (
    <Card className="sticky top-6 self-start">
      <CardHeader>
        <CardTitle className="text-lg">Live-Vorschau</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col rounded-lg border border-border p-3">
            <span className="text-xs text-muted-foreground">Einmalig</span>
            {discountAmount > 0 && (
              <span className="text-xs tabular-nums text-muted-foreground line-through">
                {EUR.format(fix)}
              </span>
            )}
            <span className="mt-1 text-lg font-semibold tabular-nums">{EUR.format(fixAfter)}</span>
          </div>
          <div className="flex flex-col rounded-lg border border-border p-3">
            <span className="text-xs text-muted-foreground">Monatlich</span>
            <span className="mt-1 text-lg font-semibold tabular-nums">{EUR.format(monthly)}</span>
          </div>
        </div>
        {loading && <p className="text-xs text-muted-foreground">Preise werden geladen…</p>}
        {!loading && items.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Noch keine Positionen ausgewählt.
          </p>
        )}
        {fixItems.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase text-muted-foreground">Einmalig</span>
            {fixItems.map((i) => (
              <div key={`f-${i.article_number}`} className="flex items-baseline justify-between gap-2 text-xs">
                <span className="truncate">
                  {i.short_name}
                  {i.quantity > 1 && <span className="text-muted-foreground"> × {i.quantity}</span>}
                </span>
                <span className="tabular-nums text-muted-foreground">{EUR.format(i.total)}</span>
              </div>
            ))}
          </div>
        )}
        {monthItems.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase text-muted-foreground">Monatlich</span>
            {monthItems.map((i) => (
              <div key={`m-${i.article_number}`} className="flex items-baseline justify-between gap-2 text-xs">
                <span className="truncate">
                  {i.short_name}
                  {i.quantity > 1 && <span className="text-muted-foreground"> × {i.quantity}</span>}
                </span>
                <span className="tabular-nums text-muted-foreground">{EUR.format(i.total)}</span>
              </div>
            ))}
          </div>
        )}
        {(fix > 0 || monthly > 0) && (
          <>
            <Separator />
            <p className="text-xs text-muted-foreground">
              Alle Preise netto. Monatliche Positionen werden über 12 Monate mit{" "}
              <span className="font-medium text-foreground tabular-nums">
                {EUR.format(monthly * 12)}
              </span>{" "}
              Jahres­volumen kalkuliert.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
