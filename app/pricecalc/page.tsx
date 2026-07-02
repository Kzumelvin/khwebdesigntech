"use client"
import React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import type { PricingType } from '@/app/api/pricing/route'

const CSV_HEADER_MAP: Record<string, keyof PricingType> = {
  "Name": "short_name",
  "Artikelnummer": "article_number",
  "Beschreibung": "description",
  "Typ": "article_type",
  "Netto-Preis": "netto_price",
  "Brutto-Preis": "brutto_price",
  "Einheitbezeichnung Einzel": "unit_single",
  "Einheitbezeichnung Mehrfach": "unit_multiple",
}

const PRICE_FIELDS: (keyof PricingType)[] = ["netto_price", "brutto_price"]

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false
  const s = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ';') {
      row.push(field)
      field = ""
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else {
      field += c
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((r) => r.some((f) => f.trim() !== ""))
}

function parseGermanNumber(value: string): number {
  const cleaned = value.trim().replace(/\./g, "").replace(",", ".")
  const num = parseFloat(cleaned)
  return Number.isNaN(num) ? 0 : num
}

function rowsToPricing(rows: string[][]): PricingType[] {
  if (rows.length === 0) return []

  const header = rows[0].map((h) => h.trim().replace(/^﻿/, ""))
  const dataRows = rows.slice(1)

  return dataRows.map((row) => {
    const entry = {} as PricingType
    header.forEach((columnName, index) => {
      const field = CSV_HEADER_MAP[columnName]
      if (!field) return
      const raw = (row[index] ?? "").trim()
      if (PRICE_FIELDS.includes(field)) {
        (entry[field] as number) = parseGermanNumber(raw)
      } else {
        (entry[field] as string) = raw
      }
    })
    return entry
  })
}

function page() {
  const [pricing, setPricing] = React.useState<PricingType[]>([])
  const [fileName, setFileName] = React.useState<string>("")
  const [uploading, setUploading] = React.useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const text = await file.text()
    const rows = parseCsv(text)
    const parsed = rowsToPricing(rows)

    if (parsed.length === 0) {
      toast.error("Es konnten keine Produkte aus der CSV-Datei gelesen werden.")
      setPricing([])
      return
    }

    setPricing(parsed)
    toast.success(`${parsed.length} Produkte eingelesen.`)
  }

  async function handleUpload() {
    if (pricing.length === 0) return

    setUploading(true)
    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricing }),
      })

      if (!res.ok) {
        const message = await res.text()
        throw new Error(message)
      }

      toast.success(`${pricing.length} Produkte erfolgreich gespeichert.`)
    } catch (error) {
      toast.error(`Fehler beim Speichern: ${error instanceof Error ? error.message : error}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Preisliste importieren</CardTitle>
          <CardDescription>
            CSV-Datei auswählen, Vorschau prüfen und die Produkte per Upsert in die Datenbank einspielen.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input type="file" accept=".csv" onChange={handleFileChange} />
          {fileName && (
            <p className="text-sm text-muted-foreground">
              Datei: {fileName} — {pricing.length} Produkte erkannt
            </p>
          )}

          {pricing.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Artikelnummer</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Netto</TableHead>
                  <TableHead>Brutto</TableHead>
                  <TableHead>Einheit (Einzel/Mehrfach)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricing.map((item) => (
                  <TableRow key={item.article_number}>
                    <TableCell>{item.short_name}</TableCell>
                    <TableCell>{item.article_number}</TableCell>
                    <TableCell>{item.article_type}</TableCell>
                    <TableCell>{item.netto_price.toFixed(2)}</TableCell>
                    <TableCell>{item.brutto_price.toFixed(2)}</TableCell>
                    <TableCell>{item.unit_single} / {item.unit_multiple}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpload} disabled={pricing.length === 0 || uploading}>
            {uploading ? "Wird gespeichert…" : "In Datenbank einspielen"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default page
