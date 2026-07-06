"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import type { PricingType } from "@/app/api/pricing/route"
import {
  ADDON_ARTICLES,
  EUR,
  WEBSITE_ARTICLES,
  type QuoteAction,
  type QuoteState,
  type WebsiteType,
} from "../state"

type Props = {
  website: QuoteState["website"]
  pricing: PricingType[]
  dispatch: React.Dispatch<QuoteAction>
}

const WEBSITE_KEYS: WebsiteType[] = [
  "onepager",
  "business_card",
  "company",
  "extensive",
  "shop",
  "webapp",
]

const ADDON_LABELS: Record<keyof QuoteState["website"]["addons"], string> = {
  logo: "Logo Design",
  corporate_design: "Corporate Design (komplett)",
  legal_pages: "Impressum / Datenschutz / DSGVO",
  cookie_consent: "Cookie-Consent Lösung",
  seo_setup: "SEO-Optimierung",
}

const ADDON_ARTICLE_KEYS: Record<keyof QuoteState["website"]["addons"], keyof typeof ADDON_ARTICLES> = {
  logo: "logo",
  corporate_design: "corporate_design",
  legal_pages: "legal_pages",
  cookie_consent: "cookie_consent",
  seo_setup: "seo_setup",
}

export function StepWebsite({ website, pricing, dispatch }: Props) {
  const lookup = React.useMemo(
    () => new Map(pricing.map((p) => [p.article_number, p])),
    [pricing],
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">Website</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Typ, Umfang und Zusatzleistungen für die Website festlegen.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Website-Typ</span>
        <RadioGroup
          value={website.type}
          onValueChange={(v) => dispatch({ type: "SET_WEBSITE_TYPE", value: v as WebsiteType })}
          className="grid gap-2 sm:grid-cols-2"
        >
          {WEBSITE_KEYS.map((key) => {
            const article = lookup.get(WEBSITE_ARTICLES[key])
            if (!article) return null
            return (
              <label
                key={key}
                htmlFor={`ws-${key}`}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              >
                <span className="flex items-center gap-3">
                  <RadioGroupItem id={`ws-${key}`} value={key} />
                  <span className="text-sm font-medium">{article.short_name}</span>
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {EUR.format(article.netto_price)}
                </span>
              </label>
            )
          })}
        </RadioGroup>
      </div>

      <Separator />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="extra_pages">Zusätzliche Unterseiten</Label>
          <Input
            id="extra_pages"
            type="number"
            min={0}
            value={website.extra_pages}
            onChange={(e) =>
              dispatch({
                type: "SET_WEBSITE_FIELD",
                field: "extra_pages",
                value: Math.max(0, Number(e.target.value) || 0),
              })
            }
          />
          <PriceHint article={lookup.get(ADDON_ARTICLES.extra_page)} />
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Zusatzleistungen</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(ADDON_LABELS) as (keyof QuoteState["website"]["addons"])[]).map((addon) => {
            const article = lookup.get(ADDON_ARTICLES[ADDON_ARTICLE_KEYS[addon]])
            const checked = website.addons[addon]
            return (
              <label
                key={addon}
                htmlFor={`ao-${addon}`}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              >
                <span className="flex items-center gap-3">
                  <Checkbox
                    id={`ao-${addon}`}
                    checked={checked}
                    onCheckedChange={() =>
                      dispatch({ type: "TOGGLE_WEBSITE_ADDON", addon })
                    }
                  />
                  <span className="text-sm">{ADDON_LABELS[addon]}</span>
                </span>
                {article && (
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {EUR.format(article.netto_price)}
                  </span>
                )}
              </label>
            )
          })}
        </div>
      </div>

      <Separator />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="webdesign_hours">Webdesign / Entwicklung (Stunden)</Label>
          <Input
            id="webdesign_hours"
            type="number"
            min={0}
            value={website.webdesign_hours}
            onChange={(e) =>
              dispatch({
                type: "SET_WEBSITE_FIELD",
                field: "webdesign_hours",
                value: Math.max(0, Number(e.target.value) || 0),
              })
            }
          />
          <PriceHint article={lookup.get(ADDON_ARTICLES.webdesign_hours)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="graphic_hours">Grafik- / Mediendesign (Stunden)</Label>
          <Input
            id="graphic_hours"
            type="number"
            min={0}
            value={website.graphic_hours}
            onChange={(e) =>
              dispatch({
                type: "SET_WEBSITE_FIELD",
                field: "graphic_hours",
                value: Math.max(0, Number(e.target.value) || 0),
              })
            }
          />
          <PriceHint article={lookup.get(ADDON_ARTICLES.graphic_hours)} />
        </div>
      </div>
    </div>
  )
}

function PriceHint({ article }: { article?: PricingType }) {
  if (!article) return null
  return (
    <span className="text-xs text-muted-foreground">
      {EUR.format(article.netto_price)} / {article.unit_single}
    </span>
  )
}
