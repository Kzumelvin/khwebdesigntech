import { pb } from "@/lib/pocketbase"

export type PricingType = {
  short_name: string,
  article_number: string,
  description: string,
  article_type: "Ware" | "Dienstleistung"
  netto_price: number,
  brutto_price: number,
  unit_single: string,
  unit_multiple: string
}

export async function POST(request: Request) {

  const data = await request.json()
  const pricing: PricingType[] = await data.pricing

  if (!Array.isArray(pricing) || pricing.length === 0) {
    return new Response("Keine Daten übermittelt", { status: 400 })
  }

  try {
    // pricing_table records are linked to CSV rows via article_number, since
    // the CSV has no PocketBase record id. Look up existing ids first so the
    // batch upsert below updates matches instead of creating duplicates.
    const existing = await pb.collection("pricing_table").getFullList()
    const idByArticleNumber = new Map(
      existing.map((record) => [record.article_number, record.id])
    )

    const batch = pb.createBatch()
    for (const item of pricing) {
      const id = idByArticleNumber.get(item.article_number)
      batch.collection("pricing_table").upsert(id ? { ...item, id } : item)
    }
    const result = await batch.send()

    return Response.json(result, { status: 200 })


  } catch (error) {

    console.log("Ein Fehler ist aufgetreten", error)
    return new Response(`Fehler: ${error}`, { status: 400 })

  }

}


export async function GET(req: Request) {

  return Response.json({})

}
