"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import type { PricingType } from "@/app/api/pricing/route"
import {
  EUR,
  RECURRING_ARTICLES,
  type QuoteAction,
  type QuoteState,
} from "../state"

type Props = {
  recurring: QuoteState["recurring"]
  pricing: PricingType[]
  dispatch: React.Dispatch<QuoteAction>
}

export function StepRecurring({ recurring, pricing, dispatch }: Props) {
  const lookup = React.useMemo(
    () => new Map(pricing.map((p) => [p.article_number, p])),
    [pricing],
  )

  const hosting = lookup.get(RECURRING_ARTICLES.hosting)
  const domain = lookup.get(RECURRING_ARTICLES.domain)
  const mailbox = lookup.get(RECURRING_ARTICLES.mailbox)
  const maintenance = lookup.get(RECURRING_ARTICLES.maintenance)
  const content = lookup.get(RECURRING_ARTICLES.content_hours)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">Laufende Leistungen</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Monatliche Kosten – bestimmen den Monatsbetrag in der Live-Vorschau.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <ToggleRow
          id="hosting"
          label="Hosting"
          checked={recurring.hosting}
          onToggle={() => dispatch({ type: "TOGGLE_RECURRING", field: "hosting" })}
          article={hosting}
        />
        <ToggleRow
          id="domain"
          label="Domain (Jahresbetrag anteilig /Monat)"
          checked={recurring.domain}
          onToggle={() => dispatch({ type: "TOGGLE_RECURRING", field: "domain" })}
          article={domain}
          suffix={domain ? ` / ${domain.unit_single}` : ""}
        />
        <ToggleRow
          id="maintenance"
          label="Wartung / Update / Support"
          checked={recurring.maintenance}
          onToggle={() => dispatch({ type: "TOGGLE_RECURRING", field: "maintenance" })}
          article={maintenance}
        />
      </div>

      <Separator />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="mailboxes">E-Mail Postfächer</Label>
          <Input
            id="mailboxes"
            type="number"
            min={0}
            value={recurring.mailboxes}
            onChange={(e) =>
              dispatch({
                type: "SET_RECURRING_FIELD",
                field: "mailboxes",
                value: Math.max(0, Number(e.target.value) || 0),
              })
            }
          />
          {mailbox && (
            <span className="text-xs text-muted-foreground">
              {EUR.format(mailbox.netto_price)} / {mailbox.unit_single} pro Postfach
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="content_hours">Content-Pflege (Stunden / Monat)</Label>
          <Input
            id="content_hours"
            type="number"
            min={0}
            value={recurring.content_hours_per_month}
            onChange={(e) =>
              dispatch({
                type: "SET_RECURRING_FIELD",
                field: "content_hours_per_month",
                value: Math.max(0, Number(e.target.value) || 0),
              })
            }
          />
          {content && (
            <span className="text-xs text-muted-foreground">
              {EUR.format(content.netto_price)} / {content.unit_single}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function ToggleRow({
  id,
  label,
  checked,
  onToggle,
  article,
  suffix,
}: {
  id: string
  label: string
  checked: boolean
  onToggle: () => void
  article?: PricingType
  suffix?: string
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
    >
      <span className="flex items-center gap-3">
        <Checkbox id={id} checked={checked} onCheckedChange={onToggle} />
        <span className="text-sm">{label}</span>
      </span>
      {article && (
        <span className="text-sm tabular-nums text-muted-foreground">
          {EUR.format(article.netto_price)}
          {suffix ?? ` / ${article.unit_single}`}
        </span>
      )}
    </label>
  )
}
