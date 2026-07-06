"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeftIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EUR } from "@/components/quote/state"

type OfferListItem = {
  id: string
  customer: string
  fix_total: number
  fix_after_total: number
  monthly_total: number
  created: string
  updated: string
}

const DATE_FMT = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
})

export default function OffersListPage() {
  const [offers, setOffers] = React.useState<OfferListItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/offers", { cache: "no-store" })
      if (!res.ok) throw new Error(await res.text())
      const data: OfferListItem[] = await res.json()
      setOffers(data)
    } catch (error) {
      toast.error(
        `Angebote konnten nicht geladen werden: ${
          error instanceof Error ? error.message : error
        }`,
      )
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  async function handleDelete(id: string, customer: string) {
    if (!confirm(`Angebot „${customer}" wirklich löschen?`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/offers/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      setOffers((list) => list.filter((o) => o.id !== id))
      toast.success("Angebot gelöscht.")
    } catch (error) {
      toast.error(
        `Löschen fehlgeschlagen: ${error instanceof Error ? error.message : error}`,
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Angebote
          </span>
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
            Gespeicherte Kostenvoranschläge
          </h1>
          <p className="text-sm text-muted-foreground">
            Klicke auf einen Kunden, um das Angebot wieder zu laden und weiterzubearbeiten.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/quote">
              <ArrowLeftIcon /> Zum Wizard
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/quote">
              <PlusIcon /> Neu
            </Link>
          </Button>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Wird geladen…</p>
        ) : offers.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            Noch keine Angebote vorhanden. Lege im Wizard das erste an.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kunde</TableHead>
                <TableHead className="text-right">Einmalig</TableHead>
                <TableHead className="text-right">Monatlich</TableHead>
                <TableHead>Aktualisiert</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <Link
                      href={`/quote?id=${o.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {o.customer}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {EUR.format(o.fix_after_total ?? o.fix_total)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {EUR.format(o.monthly_total)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {o.updated ? DATE_FMT.format(new Date(o.updated)) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(o.id, o.customer)}
                      disabled={deletingId === o.id}
                    >
                      <Trash2Icon />
                      {deletingId === o.id ? "…" : "Löschen"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </main>
  )
}
