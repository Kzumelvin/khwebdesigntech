import { pb } from "@/lib/pocketbase"
import type { QuoteState } from "@/components/quote/state"

export type OfferRecord = {
  id: string
  customer: string
  state: QuoteState
  fix_total: number
  fix_after_total: number
  monthly_total: number
  created: string
  updated: string
}

type CreateBody = {
  customer: string
  state: QuoteState
  fix_total: number
  fix_after_total: number
  monthly_total: number
}

export async function GET() {
  try {
    const records = await pb.collection("offers").getFullList({
      sort: "-updated",
      fields: "id,customer,fix_total,fix_after_total,monthly_total,created,updated",
    })
    return Response.json(records, { status: 200 })
  } catch (error) {
    console.log("Fehler beim Laden der Angebote", error)
    return new Response(`Fehler: ${error}`, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateBody
    if (!body.state) {
      return new Response("state fehlt", { status: 400 })
    }
    const record = await pb.collection("offers").create({
      customer: body.customer || "Ohne Namen",
      state: body.state,
      fix_total: body.fix_total,
      fix_after_total: body.fix_after_total,
      monthly_total: body.monthly_total,
    })
    return Response.json(record, { status: 201 })
  } catch (error) {
    console.log("Fehler beim Anlegen des Angebots", error)
    return new Response(`Fehler: ${error}`, { status: 500 })
  }
}
