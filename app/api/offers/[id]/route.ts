import { pb } from "@/lib/pocketbase"
import type { QuoteState } from "@/components/quote/state"

type UpdateBody = {
  customer: string
  state: QuoteState
  fix_total: number
  fix_after_total: number
  monthly_total: number
}

export async function GET(_req: Request, ctx: RouteContext<"/api/offers/[id]">) {
  const { id } = await ctx.params
  try {
    const record = await pb.collection("offers").getOne(id)
    return Response.json(record, { status: 200 })
  } catch (error) {
    console.log("Fehler beim Laden des Angebots", error)
    return new Response(`Fehler: ${error}`, { status: 404 })
  }
}

export async function PUT(request: Request, ctx: RouteContext<"/api/offers/[id]">) {
  const { id } = await ctx.params
  try {
    const body = (await request.json()) as UpdateBody
    const record = await pb.collection("offers").update(id, {
      customer: body.customer || "Ohne Namen",
      state: body.state,
      fix_total: body.fix_total,
      fix_after_total: body.fix_after_total,
      monthly_total: body.monthly_total,
    })
    return Response.json(record, { status: 200 })
  } catch (error) {
    console.log("Fehler beim Aktualisieren des Angebots", error)
    return new Response(`Fehler: ${error}`, { status: 500 })
  }
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/offers/[id]">) {
  const { id } = await ctx.params
  try {
    await pb.collection("offers").delete(id)
    return new Response(null, { status: 204 })
  } catch (error) {
    console.log("Fehler beim Löschen des Angebots", error)
    return new Response(`Fehler: ${error}`, { status: 500 })
  }
}
