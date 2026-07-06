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
  VIDEO_ARTICLES,
  type QuoteAction,
  type QuoteState,
  type VideoType,
} from "../state"

type Props = {
  media: QuoteState["media"]
  pricing: PricingType[]
  dispatch: React.Dispatch<QuoteAction>
}

const VIDEO_KEYS: VideoType[] = ["imagefilm", "spot", "social_clip", "interview"]

export function StepMedia({ media, pricing, dispatch }: Props) {
  const lookup = React.useMemo(
    () => new Map(pricing.map((p) => [p.article_number, p])),
    [pricing],
  )
  const music = lookup.get(ADDON_ARTICLES.music)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">Werbeproduktion</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Video, Grafik, Print – nur Positionen mit Menge &gt; 0 landen im KV.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Videoformat (optional)</span>
        <RadioGroup
          value={media.video_type}
          onValueChange={(v) => dispatch({ type: "SET_MEDIA_VIDEO", value: v as VideoType })}
          className="grid gap-2 sm:grid-cols-2"
        >
          {VIDEO_KEYS.map((key) => {
            const article = lookup.get(VIDEO_ARTICLES[key])
            if (!article) return null
            return (
              <label
                key={key}
                htmlFor={`v-${key}`}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              >
                <span className="flex items-center gap-3">
                  <RadioGroupItem id={`v-${key}`} value={key} />
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
        <NumberField
          id="shooting_days"
          label="Drehtage (Grundkosten)"
          value={media.shooting_days}
          onChange={(v) =>
            dispatch({ type: "SET_MEDIA_FIELD", field: "shooting_days", value: v })
          }
          article={lookup.get(ADDON_ARTICLES.shooting_days)}
        />
        <NumberField
          id="animation"
          label="Animation (Module)"
          value={media.animation_modules}
          onChange={(v) =>
            dispatch({ type: "SET_MEDIA_FIELD", field: "animation_modules", value: v })
          }
          article={lookup.get(ADDON_ARTICLES.animation)}
        />
        <NumberField
          id="print"
          label="Flyer / Visitenkarte / Banner (Stück)"
          value={media.print_units}
          onChange={(v) =>
            dispatch({ type: "SET_MEDIA_FIELD", field: "print_units", value: v })
          }
          article={lookup.get(ADDON_ARTICLES.print)}
        />
        <NumberField
          id="m-graphic"
          label="Grafik- / Mediendesign (Stunden)"
          value={media.graphic_hours}
          onChange={(v) =>
            dispatch({ type: "SET_MEDIA_FIELD", field: "graphic_hours", value: v })
          }
          article={lookup.get(ADDON_ARTICLES.graphic_hours)}
        />
      </div>

      <Separator />

      <label
        htmlFor="music"
        className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
      >
        <span className="flex items-center gap-3">
          <Checkbox
            id="music"
            checked={media.music}
            onCheckedChange={() => dispatch({ type: "TOGGLE_MEDIA_MUSIC" })}
          />
          <span className="text-sm">Lizenzfreie Musik + Sounddesign</span>
        </span>
        {music && (
          <span className="text-sm tabular-nums text-muted-foreground">
            {EUR.format(music.netto_price)}
          </span>
        )}
      </label>
    </div>
  )
}

function NumberField({
  id,
  label,
  value,
  onChange,
  article,
}: {
  id: string
  label: string
  value: number
  onChange: (v: number) => void
  article?: PricingType
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
      />
      {article && (
        <span className="text-xs text-muted-foreground">
          {EUR.format(article.netto_price)} / {article.unit_single}
        </span>
      )}
    </div>
  )
}
