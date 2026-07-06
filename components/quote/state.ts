import type { PricingType } from "@/app/api/pricing/route"

export type ServiceKind = "website" | "media" | "recurring"

export const WEBSITE_ARTICLES = {
  onepager: "AN-2026-00051",
  business_card: "AN-2026-00052",
  company: "AN-2026-00053",
  extensive: "AN-2026-00054",
  shop: "AN-2026-00056",
  webapp: "AN-2026-00057",
} as const
export type WebsiteType = keyof typeof WEBSITE_ARTICLES | ""

export const VIDEO_ARTICLES = {
  imagefilm: "AN-2026-00060",
  spot: "AN-2026-00061",
  social_clip: "AN-2026-00059",
  interview: "AN-2026-00058",
} as const
export type VideoType = keyof typeof VIDEO_ARTICLES | ""

export const ADDON_ARTICLES = {
  extra_page: "AN-2026-00055",
  logo: "AN-2026-00066",
  corporate_design: "AN-2026-00067",
  legal_pages: "AN-2026-00074",
  cookie_consent: "AN-2026-00073",
  seo_setup: "AN-2026-00075",
  webdesign_hours: "AN-2026-00048",
  graphic_hours: "AN-2026-00049",
  shooting_days: "AN-2026-00062",
  animation: "AN-2026-00063",
  music: "AN-2026-00064",
  print: "AN-2026-00068",
} as const

export const RECURRING_ARTICLES = {
  hosting: "AN-2026-00070",
  domain: "AN-2026-00069",
  mailbox: "AN-2026-00071",
  maintenance: "AN-2026-00072",
  content_hours: "AN-2026-00050",
} as const

export type ContactMeta = {
  company: string
  contact: string
  meeting_date: string
  occasion: string
  audience: string
  deadline: string
  budget: string
}

export type QuoteState = {
  id: string | null
  step: number
  contact: ContactMeta
  kinds: Record<ServiceKind, boolean>
  website: {
    type: WebsiteType
    extra_pages: number
    addons: {
      logo: boolean
      corporate_design: boolean
      legal_pages: boolean
      cookie_consent: boolean
      seo_setup: boolean
    }
    webdesign_hours: number
    graphic_hours: number
  }
  media: {
    video_type: VideoType
    shooting_days: number
    animation_modules: number
    music: boolean
    print_units: number
    graphic_hours: number
  }
  recurring: {
    hosting: boolean
    domain: boolean
    mailboxes: number
    maintenance: boolean
    content_hours_per_month: number
  }
  discount: {
    type: "fixed" | "percent"
    value: number
  }
  notes: string
}

export const initialQuoteState: QuoteState = {
  id: null,
  step: 0,
  contact: {
    company: "",
    contact: "",
    meeting_date: "",
    occasion: "",
    audience: "",
    deadline: "",
    budget: "",
  },
  kinds: { website: false, media: false, recurring: false },
  website: {
    type: "",
    extra_pages: 0,
    addons: {
      logo: false,
      corporate_design: false,
      legal_pages: false,
      cookie_consent: false,
      seo_setup: false,
    },
    webdesign_hours: 0,
    graphic_hours: 0,
  },
  media: {
    video_type: "",
    shooting_days: 0,
    animation_modules: 0,
    music: false,
    print_units: 0,
    graphic_hours: 0,
  },
  recurring: {
    hosting: false,
    domain: false,
    mailboxes: 0,
    maintenance: false,
    content_hours_per_month: 0,
  },
  discount: {
    type: "fixed",
    value: 0,
  },
  notes: "",
}

export type QuoteAction =
  | { type: "SET_STEP"; step: number }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "SET_CONTACT"; field: keyof ContactMeta; value: string }
  | { type: "TOGGLE_KIND"; kind: ServiceKind }
  | { type: "SET_WEBSITE_TYPE"; value: WebsiteType }
  | { type: "SET_WEBSITE_FIELD"; field: "extra_pages" | "webdesign_hours" | "graphic_hours"; value: number }
  | { type: "TOGGLE_WEBSITE_ADDON"; addon: keyof QuoteState["website"]["addons"] }
  | { type: "SET_MEDIA_VIDEO"; value: VideoType }
  | { type: "SET_MEDIA_FIELD"; field: "shooting_days" | "animation_modules" | "print_units" | "graphic_hours"; value: number }
  | { type: "TOGGLE_MEDIA_MUSIC" }
  | { type: "TOGGLE_RECURRING"; field: "hosting" | "domain" | "maintenance" }
  | { type: "SET_RECURRING_FIELD"; field: "mailboxes" | "content_hours_per_month"; value: number }
  | { type: "SET_DISCOUNT_TYPE"; value: "fixed" | "percent" }
  | { type: "SET_DISCOUNT_VALUE"; value: number }
  | { type: "SET_NOTES"; value: string }
  | { type: "LOAD"; state: QuoteState }
  | { type: "SET_ID"; id: string | null }
  | { type: "RESET" }

export const TOTAL_STEPS = 7

export function quoteReducer(state: QuoteState, action: QuoteAction): QuoteState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: Math.max(0, Math.min(TOTAL_STEPS - 1, action.step)) }
    case "NEXT":
      return { ...state, step: Math.min(TOTAL_STEPS - 1, state.step + 1) }
    case "PREV":
      return { ...state, step: Math.max(0, state.step - 1) }
    case "SET_CONTACT":
      return { ...state, contact: { ...state.contact, [action.field]: action.value } }
    case "TOGGLE_KIND":
      return { ...state, kinds: { ...state.kinds, [action.kind]: !state.kinds[action.kind] } }
    case "SET_WEBSITE_TYPE":
      return { ...state, website: { ...state.website, type: action.value } }
    case "SET_WEBSITE_FIELD":
      return { ...state, website: { ...state.website, [action.field]: action.value } }
    case "TOGGLE_WEBSITE_ADDON":
      return {
        ...state,
        website: {
          ...state.website,
          addons: { ...state.website.addons, [action.addon]: !state.website.addons[action.addon] },
        },
      }
    case "SET_MEDIA_VIDEO":
      return { ...state, media: { ...state.media, video_type: action.value } }
    case "SET_MEDIA_FIELD":
      return { ...state, media: { ...state.media, [action.field]: action.value } }
    case "TOGGLE_MEDIA_MUSIC":
      return { ...state, media: { ...state.media, music: !state.media.music } }
    case "TOGGLE_RECURRING":
      return { ...state, recurring: { ...state.recurring, [action.field]: !state.recurring[action.field] } }
    case "SET_RECURRING_FIELD":
      return { ...state, recurring: { ...state.recurring, [action.field]: action.value } }
    case "SET_DISCOUNT_TYPE":
      return { ...state, discount: { ...state.discount, type: action.value } }
    case "SET_DISCOUNT_VALUE":
      return {
        ...state,
        discount: { ...state.discount, value: Math.max(0, action.value) },
      }
    case "SET_NOTES":
      return { ...state, notes: action.value }
    case "LOAD":
      return { ...action.state, step: state.step }
    case "SET_ID":
      return { ...state, id: action.id }
    case "RESET":
      return initialQuoteState
    default:
      return state
  }
}

export type LineItem = {
  article_number: string
  short_name: string
  quantity: number
  unit: string
  unit_price: number
  total: number
  bucket: "fix" | "monthly"
}

type PriceLookup = Map<string, PricingType>

function push(
  items: LineItem[],
  lookup: PriceLookup,
  article: string,
  quantity: number,
  bucket: "fix" | "monthly",
) {
  if (quantity <= 0) return
  const p = lookup.get(article)
  if (!p) return
  const unit = quantity === 1 ? p.unit_single : p.unit_multiple
  items.push({
    article_number: p.article_number,
    short_name: p.short_name,
    quantity,
    unit,
    unit_price: p.netto_price,
    total: p.netto_price * quantity,
    bucket,
  })
}

export function computeLineItems(state: QuoteState, pricing: PricingType[]): LineItem[] {
  const lookup: PriceLookup = new Map(pricing.map((p) => [p.article_number, p]))
  const items: LineItem[] = []

  if (state.kinds.website) {
    if (state.website.type) {
      push(items, lookup, WEBSITE_ARTICLES[state.website.type], 1, "fix")
    }
    push(items, lookup, ADDON_ARTICLES.extra_page, state.website.extra_pages, "fix")
    const a = state.website.addons
    if (a.logo) push(items, lookup, ADDON_ARTICLES.logo, 1, "fix")
    if (a.corporate_design) push(items, lookup, ADDON_ARTICLES.corporate_design, 1, "fix")
    if (a.legal_pages) push(items, lookup, ADDON_ARTICLES.legal_pages, 1, "fix")
    if (a.cookie_consent) push(items, lookup, ADDON_ARTICLES.cookie_consent, 1, "fix")
    if (a.seo_setup) push(items, lookup, ADDON_ARTICLES.seo_setup, 1, "fix")
    push(items, lookup, ADDON_ARTICLES.webdesign_hours, state.website.webdesign_hours, "fix")
    push(items, lookup, ADDON_ARTICLES.graphic_hours, state.website.graphic_hours, "fix")
  }

  if (state.kinds.media) {
    if (state.media.video_type) {
      push(items, lookup, VIDEO_ARTICLES[state.media.video_type], 1, "fix")
    }
    push(items, lookup, ADDON_ARTICLES.shooting_days, state.media.shooting_days, "fix")
    push(items, lookup, ADDON_ARTICLES.animation, state.media.animation_modules, "fix")
    if (state.media.music) push(items, lookup, ADDON_ARTICLES.music, 1, "fix")
    push(items, lookup, ADDON_ARTICLES.print, state.media.print_units, "fix")
    push(items, lookup, ADDON_ARTICLES.graphic_hours, state.media.graphic_hours, "fix")
  }

  if (state.kinds.recurring) {
    if (state.recurring.hosting) push(items, lookup, RECURRING_ARTICLES.hosting, 1, "monthly")
    if (state.recurring.domain) {
      const domain = lookup.get(RECURRING_ARTICLES.domain)
      if (domain) {
        items.push({
          article_number: domain.article_number,
          short_name: `${domain.short_name} (anteilig /Monat)`,
          quantity: 1,
          unit: "Monat",
          unit_price: domain.netto_price / 12,
          total: domain.netto_price / 12,
          bucket: "monthly",
        })
      }
    }
    push(items, lookup, RECURRING_ARTICLES.mailbox, state.recurring.mailboxes, "monthly")
    if (state.recurring.maintenance) push(items, lookup, RECURRING_ARTICLES.maintenance, 1, "monthly")
    push(items, lookup, RECURRING_ARTICLES.content_hours, state.recurring.content_hours_per_month, "monthly")
  }

  return items
}

export function sumBuckets(items: LineItem[]) {
  const fix = items.filter((i) => i.bucket === "fix").reduce((s, i) => s + i.total, 0)
  const monthly = items.filter((i) => i.bucket === "monthly").reduce((s, i) => s + i.total, 0)
  return { fix, monthly }
}

export function applyDiscount(fix: number, discount: QuoteState["discount"]) {
  if (fix <= 0 || discount.value <= 0) {
    return { discountAmount: 0, fixAfter: fix }
  }
  const raw =
    discount.type === "percent" ? fix * (discount.value / 100) : discount.value
  const discountAmount = Math.min(Math.max(0, raw), fix)
  return { discountAmount, fixAfter: fix - discountAmount }
}

export const EUR = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" })
