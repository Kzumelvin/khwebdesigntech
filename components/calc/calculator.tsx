"use client"
import { CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ChartConfig, ChartContainer } from "../ui/chart"
import { useMemo, useState } from "react"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Separator } from "../ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"


type ChartDataType = {
  year: number,
  me: number,
  extern: number
}

const chartConfig = {
  me: {
    label: "Ich",
    color: "var(--primary)"
  },
  extern: {
    label: "Extern",
    color: "var(--color-red-800)"
  }
} satisfies ChartConfig


type BreakEvenResult = {
  year: number
  exactYear: number
  value: number
}

function getBreakEvenPoint(chartData: ChartDataType[]): BreakEvenResult | null {
  const sorted = [...chartData].sort((a, b) => a.year - b.year)

  for (let i = 0; i < sorted.length; i++) {
    const diff = sorted[i].me - sorted[i].extern

    if (diff === 0) {
      return { year: sorted[i].year, exactYear: sorted[i].year, value: sorted[i].me }
    }

    if (i === 0) continue

    const prev = sorted[i - 1]
    const curr = sorted[i]
    const prevDiff = prev.me - prev.extern
    if (Math.sign(diff) !== Math.sign(prevDiff)) {
      // diff and prevDiff have opposite signs, so the zero crossing
      // splits the gap to curr proportionally to their absolute distances from 0
      const t = Math.abs(prevDiff) / (Math.abs(prevDiff) + Math.abs(diff))
      const exactYear = prev.year + t * (curr.year - prev.year)
      const value = prev.me + t * (curr.me - prev.me)
      return { year: Math.ceil(exactYear), exactYear, value }
    }
  }

  return null
}

function getChartData(years: number, meFixPrice: number, meMonthPrice: number, externFixPrice: number, externMonthPrice: number): ChartDataType[] {

  const chartData: ChartDataType[] = []

  for (let i = 0; i < years; i++) {

    if (i === 0) {
      chartData.push({ year: i + 1, me: meFixPrice + (meMonthPrice * 12), extern: externFixPrice + (externMonthPrice * 12) })
    } else {

      const lastYear = chartData.find(f => f.year == i)!
      chartData.push({ year: i + 1, me: lastYear.me + (meMonthPrice * 12), extern: lastYear.extern + (externMonthPrice * 12) })

    }

  }

  return chartData

}

function Calculator() {

  const [meMonthPrice, setMeMonthPrice] = useState(0)
  const [meFixPrice, setMeFixPrice] = useState(0)
  const [externMonthPrice, setExternMonthPrice] = useState(0)
  const [externFixPrice, setExternFixPrice] = useState(0)
  const [years, setYears] = useState(0)

  const chartData = useMemo(
    () => getChartData(years, meFixPrice, meMonthPrice, externFixPrice, externMonthPrice),
    [meFixPrice, meMonthPrice, externFixPrice, externMonthPrice, years]
  )
  const breakEven = useMemo(() => getBreakEvenPoint(chartData), [chartData])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading font-bold text-2xl">Preiskalkulator</CardTitle>
      </CardHeader>
      <CardContent className="">
        <div className="flex flex-col gap-3">
          <Separator />
          <div className="flex flex-col gap-3">
            <Label htmlFor="life">Lebensdauer der Website</Label>
            <Input id="life" type="number" placeholder="Jahre" value={years} onChange={(e) => setYears(Number(e.target.value))} />
          </div>
          <Separator />
          <div className="w-full flex flex-warp flex-row justify-between">
            <div className="flex flex-col gap-3">
              <Label htmlFor="meFix">Meine einmaligen Kosten</Label>
              <Input id="meFix" type="number" placeholder="Mein Fixpreis" value={meFixPrice} onChange={(e) => setMeFixPrice(Number(e.target.value))} />
              <Label htmlFor="meMonth">Meine mtl. Kosten</Label>
              <Input id="meMonth" type="number" placeholder="Mein mtl. Preis" value={meMonthPrice} onChange={(e) => setMeMonthPrice(Number(e.target.value))} />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="externFix">Externe einmalige Kosten</Label>
              <Input id="externFix" type="number" placeholder="Externer Fixpreis" value={externFixPrice} onChange={(e) => setExternFixPrice(Number(e.target.value))} />
              <Label htmlFor="externMonth">Externe mtl. Kosten</Label>
              <Input id="externMonth" type="number" placeholder="Externer mtl. Preis" value={externMonthPrice} onChange={(e) => setExternMonthPrice(Number(e.target.value))} />
            </div>

          </div>
          <Separator />
          <div className="w-full flex flex-col gap-3">
            <h3 className="font-heading font-bold text-xl">Berechnung</h3>
            <div className="flex flex-col gap-4">
              <p>{`Mein Endpreis nach ${years} Jahren: ${chartData.at(-1)?.me.toLocaleString('de-DE', { style: "currency", currency: "EUR" }) || ""}`}</p>
              <p>{`Externer Endpreis nach ${years} Jahren: ${chartData.at(-1)?.extern.toLocaleString('de-DE', { style: "currency", currency: "EUR" }) || ""}`}</p>
              <p className="text-3xl">{`Ersparnis: ${((chartData.at(-1)?.extern || 0) - (chartData.at(-1)?.me || 0)).toLocaleString('de-DE', { style: "currency", currency: "EUR" })}`}</p>
            </div>
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jahr</TableHead>
                    <TableHead>Mein Preis</TableHead>
                    <TableHead>Externer Preis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartData.map(data => (
                    <TableRow key={data.year}>
                      <TableCell>{data.year}</TableCell>
                      <TableCell>{`${data.me.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`}</TableCell>
                      <TableCell>{`${data.extern.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col gap-3">
            <h3 className="font-heading font-bold text-xl">Schaubild</h3>
            <ChartContainer config={chartConfig} className="min-h-50">

              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{ left: 12, right: 12 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey={"year"}
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickLine={true}
                  axisLine={true}
                  tickMargin={8}
                  tickFormatter={(value) => `Jahr ${value}`}
                />
                <YAxis
                  domain={["dataMin", "dataMax"]}
                  tickLine={true}
                  axisLine={true}
                  tickMargin={8}
                  tickFormatter={(value) => `${value} €`}

                />
                {breakEven &&
                  <ReferenceLine
                    x={breakEven.exactYear}
                    stroke="red"
                    strokeWidth={2}
                    label={{ value: `Jahr ${breakEven.exactYear.toFixed(2)} | Betrag: ${breakEven.value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`, fill: "red", position: "left" }}
                  />
                }
                <Tooltip />
                <Line
                  dataKey="me"
                  type={"monotone"}
                  stroke="var(--color-me)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey={"extern"}
                  type={"monotone"}
                  stroke="var(--color-extern)"
                  strokeWidth={2}
                  dot={false}
                />


              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Calculator 
