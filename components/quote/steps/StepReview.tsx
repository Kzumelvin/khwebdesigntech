"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { applyDiscount, EUR, type LineItem, type QuoteAction, type QuoteState } from "../state"

type Props = {
  items: LineItem[]
  fix: number
  monthly: number
  discount: QuoteState["discount"]
  dispatch: React.Dispatch<QuoteAction>
}

export function StepReview({ items, fix, monthly, discount, dispatch }: Props) {
  const { discountAmount, fixAfter } = applyDiscount(fix, discount)
  const fixItems = items.filter((i) => i.bucket === "fix")
  const monthItems = items.filter((i) => i.bucket === "monthly")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">Kostenvoranschlag</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Vorläufige Kalkulation aus dem Preis-Leistungsverzeichnis. Alle Beträge netto.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TotalCard
          label="Einmaliger Fixbetrag"
          value={fixAfter}
          strike={discountAmount > 0 ? fix : undefined}
          accent
        />
        <TotalCard label="Monatlicher Betrag" value={monthly} accent />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">Rabatt auf Fixbetrag</span>
          {discountAmount > 0 && (
            <span className="text-xs tabular-nums text-muted-foreground">
              − {EUR.format(discountAmount)}
            </span>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="discount_type">Art</Label>
            <NativeSelect
              id="discount_type"
              className="w-full"
              value={discount.type}
              onChange={(e) =>
                dispatch({
                  type: "SET_DISCOUNT_TYPE",
                  value: e.target.value as "fixed" | "percent",
                })
              }
            >
              <NativeSelectOption value="fixed">Eurobetrag (€)</NativeSelectOption>
              <NativeSelectOption value="percent">Prozent (%)</NativeSelectOption>
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="discount_value">
              {discount.type === "percent" ? "Rabatt in %" : "Rabatt in €"}
            </Label>
            <Input
              id="discount_value"
              type="number"
              min={0}
              step={discount.type === "percent" ? 1 : 10}
              max={discount.type === "percent" ? 100 : undefined}
              value={discount.value}
              onChange={(e) =>
                dispatch({
                  type: "SET_DISCOUNT_VALUE",
                  value: Number(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>
        {discountAmount > 0 && (
          <div className="flex items-baseline justify-between border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">Fix nach Rabatt</span>
            <span className="tabular-nums font-semibold">{EUR.format(fixAfter)}</span>
          </div>
        )}
      </div>

      {fixItems.length === 0 && monthItems.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Noch keine Positionen ausgewählt. Gehe zurück zu den vorherigen Schritten.
        </p>
      )}

      {fixItems.length > 0 && (
        <ItemsTable title="Einmalige Positionen" items={fixItems} total={fix} />
      )}
      {monthItems.length > 0 && (
        <ItemsTable title="Monatliche Positionen" items={monthItems} total={monthly} totalLabel="Summe / Monat" />
      )}
    </div>
  )
}

function TotalCard({
  label,
  value,
  strike,
  accent,
}: {
  label: string
  value: number
  strike?: number
  accent?: boolean
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-xl border p-5 ${
        accent ? "border-primary/40 bg-primary/5" : "border-border"
      }`}
    >
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      {strike !== undefined && (
        <span className="text-sm tabular-nums text-muted-foreground line-through">
          {EUR.format(strike)}
        </span>
      )}
      <span className="text-3xl font-semibold tabular-nums">{EUR.format(value)}</span>
    </div>
  )
}

function ItemsTable({
  title,
  items,
  total,
  totalLabel = "Summe",
}: {
  title: string
  items: LineItem[]
  total: number
  totalLabel?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-heading text-base font-semibold">{title}</h3>
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead className="text-right">Menge</TableHead>
              <TableHead>Einheit</TableHead>
              <TableHead className="text-right">Einzelpreis</TableHead>
              <TableHead className="text-right">Summe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((i) => (
              <TableRow key={`${i.bucket}-${i.article_number}`}>
                <TableCell>
                  <span className="font-medium">{i.short_name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{i.article_number}</span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{i.quantity}</TableCell>
                <TableCell>{i.unit}</TableCell>
                <TableCell className="text-right tabular-nums">{EUR.format(i.unit_price)}</TableCell>
                <TableCell className="text-right tabular-nums">{EUR.format(i.total)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4} className="text-right font-medium">
                {totalLabel}
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {EUR.format(total)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
