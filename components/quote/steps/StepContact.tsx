"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import type { ContactMeta, QuoteAction } from "../state"

type Props = {
  contact: ContactMeta
  dispatch: React.Dispatch<QuoteAction>
}

export function StepContact({ contact, dispatch }: Props) {
  const set = (field: keyof ContactMeta, value: string) =>
    dispatch({ type: "SET_CONTACT", field, value })

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-xl font-semibold">Kunde &amp; Kontext</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Rahmen für das Gespräch – hilft dir später bei der Zuordnung.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="company">Firma / Kunde</Label>
          <Input
            id="company"
            value={contact.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Musterfirma GmbH"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact">Ansprechpartner:in</Label>
          <Input
            id="contact"
            value={contact.contact}
            onChange={(e) => set("contact", e.target.value)}
            placeholder="Vor- und Nachname"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="meeting_date">Datum / Uhrzeit</Label>
          <Input
            id="meeting_date"
            type="datetime-local"
            value={contact.meeting_date}
            onChange={(e) => set("meeting_date", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="occasion">Anlass</Label>
          <NativeSelect
            id="occasion"
            className="w-full"
            value={contact.occasion}
            onChange={(e) => set("occasion", e.target.value)}
          >
            <NativeSelectOption value="">bitte wählen</NativeSelectOption>
            <NativeSelectOption value="Neugründung">Neugründung</NativeSelectOption>
            <NativeSelectOption value="Relaunch">Relaunch</NativeSelectOption>
            <NativeSelectOption value="Kampagne">Kampagne</NativeSelectOption>
            <NativeSelectOption value="Betreuung">laufende Betreuung</NativeSelectOption>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="audience">Zielgruppe</Label>
          <Input
            id="audience"
            value={contact.audience}
            onChange={(e) => set("audience", e.target.value)}
            placeholder="Wer soll erreicht werden?"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deadline">Wunschtermin / Deadline</Label>
          <Input
            id="deadline"
            type="date"
            value={contact.deadline}
            onChange={(e) => set("deadline", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="budget">Budgetrahmen</Label>
          <Input
            id="budget"
            value={contact.budget}
            onChange={(e) => set("budget", e.target.value)}
            placeholder="z. B. 5.000 – 8.000 € einmalig, bis 200 €/Monat"
          />
        </div>
      </div>
    </div>
  )
}
