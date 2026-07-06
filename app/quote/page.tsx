"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  RotateCcwIcon,
  SaveIcon,
  FolderOpenIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Stepper } from "@/components/quote/Stepper"
import { SummarySidebar } from "@/components/quote/SummarySidebar"
import { StepContact } from "@/components/quote/steps/StepContact"
import { StepKinds } from "@/components/quote/steps/StepKinds"
import { StepWebsite } from "@/components/quote/steps/StepWebsite"
import { StepMedia } from "@/components/quote/steps/StepMedia"
import { StepRecurring } from "@/components/quote/steps/StepRecurring"
import { StepNotes } from "@/components/quote/steps/StepNotes"
import { StepReview } from "@/components/quote/steps/StepReview"
import {
  TOTAL_STEPS,
  applyDiscount,
  computeLineItems,
  initialQuoteState,
  quoteReducer,
  sumBuckets,
  type QuoteState,
} from "@/components/quote/state"
import type { PricingType } from "@/app/api/pricing/route"

const STEPS = [
  { title: "Kunde & Kontext", hint: "Firma, Anlass, Budget" },
  { title: "Leistungsarten", hint: "Was ist Thema?" },
  { title: "Website", hint: "Typ, Umfang, Add-Ons" },
  { title: "Werbeproduktion", hint: "Video, Grafik, Print" },
  { title: "Laufende Leistungen", hint: "Hosting, Wartung, Content" },
  { title: "Notizen", hint: "Bauchgefühl, nächste Schritte" },
  { title: "Kostenvoranschlag", hint: "Fix & Monatlich" },
]

export default function QuotePage() {
  const [state, dispatch] = React.useReducer(quoteReducer, initialQuoteState)
  const [pricing, setPricing] = React.useState<PricingType[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    async function loadPricing() {
      try {
        const res = await fetch("/api/pricing", { cache: "no-store" })
        if (!res.ok) throw new Error(await res.text())
        const data: PricingType[] = await res.json()
        if (!cancelled) setPricing(data)
      } catch (error) {
        if (!cancelled) {
          toast.error(
            `Preisliste konnte nicht geladen werden: ${
              error instanceof Error ? error.message : error
            }`,
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    async function loadOffer() {
      const params = new URLSearchParams(window.location.search)
      const id = params.get("id")
      if (!id) return
      try {
        const res = await fetch(`/api/offers/${id}`, { cache: "no-store" })
        if (!res.ok) throw new Error(await res.text())
        const record = await res.json()
        if (cancelled) return
        const stored = record.state as QuoteState
        dispatch({
          type: "LOAD",
          state: { ...initialQuoteState, ...stored, id: record.id },
        })
        toast.success(`Angebot „${record.customer}" geladen.`)
      } catch (error) {
        if (!cancelled) {
          toast.error(
            `Angebot konnte nicht geladen werden: ${
              error instanceof Error ? error.message : error
            }`,
          )
        }
      }
    }

    loadPricing()
    loadOffer()
    return () => {
      cancelled = true
    }
  }, [])

  const items = React.useMemo(() => computeLineItems(state, pricing), [state, pricing])
  const { fix, monthly } = React.useMemo(() => sumBuckets(items), [items])
  const { discountAmount, fixAfter } = React.useMemo(
    () => applyDiscount(fix, state.discount),
    [fix, state.discount],
  )

  const step = state.step
  const progress = ((step + 1) / TOTAL_STEPS) * 100

  async function handleSave() {
    setSaving(true)
    try {
      const body = {
        customer: state.contact.company || state.contact.contact || "Ohne Namen",
        state,
        fix_total: fix,
        fix_after_total: fixAfter,
        monthly_total: monthly,
      }
      const res = await fetch(state.id ? `/api/offers/${state.id}` : "/api/offers", {
        method: state.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(await res.text())
      const record = await res.json()
      if (!state.id) {
        dispatch({ type: "SET_ID", id: record.id })
        const params = new URLSearchParams(window.location.search)
        params.set("id", record.id)
        window.history.replaceState(null, "", `${window.location.pathname}?${params}`)
      }
      toast.success(state.id ? "Angebot aktualisiert." : "Angebot gespeichert.")
    } catch (error) {
      toast.error(
        `Speichern fehlgeschlagen: ${error instanceof Error ? error.message : error}`,
      )
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    if (!confirm("Alle Eingaben zurücksetzen? Ein bereits gespeichertes Angebot bleibt in der Datenbank.")) return
    dispatch({ type: "RESET" })
    window.history.replaceState(null, "", window.location.pathname)
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepContact contact={state.contact} dispatch={dispatch} />
      case 1:
        return <StepKinds kinds={state.kinds} dispatch={dispatch} />
      case 2:
        return state.kinds.website ? (
          <StepWebsite website={state.website} pricing={pricing} dispatch={dispatch} />
        ) : (
          <SkippedStep name="Website" />
        )
      case 3:
        return state.kinds.media ? (
          <StepMedia media={state.media} pricing={pricing} dispatch={dispatch} />
        ) : (
          <SkippedStep name="Werbeproduktion" />
        )
      case 4:
        return state.kinds.recurring ? (
          <StepRecurring recurring={state.recurring} pricing={pricing} dispatch={dispatch} />
        ) : (
          <SkippedStep name="laufende Leistungen" />
        )
      case 5:
        return <StepNotes notes={state.notes} dispatch={dispatch} />
      case 6:
        return (
          <StepReview
            items={items}
            fix={fix}
            monthly={monthly}
            discount={state.discount}
            dispatch={dispatch}
          />
        )
      default:
        return null
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Erstgespräch
            </span>
            <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
              Kostenvoranschlag konfigurieren
            </h1>
            <p className="text-sm text-muted-foreground">
              Schritt-für-Schritt durch das Erstgespräch – am Ende stehen zwei Beträge:
              einmalig und monatlich.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Button asChild variant="outline" size="sm">
              <Link href="/quote/list">
                <FolderOpenIcon /> Angebote
              </Link>
            </Button>
            {state.id && (
              <span className="text-[10px] tabular-nums text-muted-foreground">
                ID: {state.id}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={progress} className="flex-1" />
          <span className="text-xs tabular-nums text-muted-foreground">
            Schritt {step + 1} / {TOTAL_STEPS}
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_320px]">
        <aside className="hidden lg:block">
          <Stepper
            steps={STEPS}
            current={step}
            onSelect={(i) => dispatch({ type: "SET_STEP", step: i })}
          />
        </aside>

        <section className="min-w-0 rounded-xl border border-border bg-card p-6 shadow-sm">
          {renderStep()}
        </section>

        <aside className="lg:block">
          <SummarySidebar
            items={items}
            fix={fix}
            fixAfter={fixAfter}
            discountAmount={discountAmount}
            monthly={monthly}
            loading={loading}
          />
        </aside>
      </div>

      <div className="sticky bottom-0 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => dispatch({ type: "PREV" })}
            disabled={step === 0}
          >
            <ArrowLeftIcon /> Zurück
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcwIcon /> Reset
            </Button>
            <Button variant="secondary" onClick={handleSave} disabled={saving}>
              <SaveIcon />
              {saving ? "Wird gespeichert…" : state.id ? "Aktualisieren" : "Speichern"}
            </Button>
          </div>
          <Button
            onClick={() => dispatch({ type: "NEXT" })}
            disabled={step === TOTAL_STEPS - 1}
          >
            Weiter <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </main>
  )
}

function SkippedStep({ name }: { name: string }) {
  return (
    <div className="flex min-h-40 flex-col items-start justify-center gap-2 rounded-lg border border-dashed border-border p-6">
      <h2 className="font-heading text-lg font-semibold">Übersprungen</h2>
      <p className="text-sm text-muted-foreground">
        {name} wurde in Schritt 2 nicht ausgewählt. Klicke auf „Weiter" oder aktiviere den
        Bereich in Schritt 2.
      </p>
    </div>
  )
}
