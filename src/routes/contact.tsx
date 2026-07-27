import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail } from "lucide-react";
import { PageBackground } from "@/components/site-chrome";
import { SETTINGS } from "@/lib/shop-data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact GiftShop — Support and Order Help" },
      { name: "description", content: "Contact the GiftShop team about an order, a missing code, refunds or bulk gift card purchases." },
      { property: "og:title", content: "Contact GiftShop" },
      { property: "og:description", content: "Send the GiftShop support team a message about your order." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", orderId: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Please enter a valid email address.";
    if (form.message.trim().length < 10) next.message = "Please add a little more detail (10+ characters).";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSent(true);
    setForm({ name: "", email: "", orderId: "", message: "" });
  };

  return (
    <PageBackground>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-3xl font-bold text-primary">Contact us</h2>
        <p className="mt-3 text-foreground/70 flex items-center gap-2">
          <Mail className="h-4 w-4" /> {SETTINGS.email}
        </p>

        {sent && (
          <p className="mt-6 rounded border border-primary bg-accent/60 p-4 text-sm text-accent-foreground">
            Thanks — your message has been queued. We reply within one business day.
          </p>
        )}

        <form onSubmit={submit} className="mt-8 space-y-5 bg-card/95 border border-border rounded p-6">
          <Field label="Your name" error={errors.name}>
            <input value={form.name} onChange={set("name")} className={inputClass} autoComplete="name" />
          </Field>
          <Field label="Email address" error={errors.email}>
            <input value={form.email} onChange={set("email")} type="email" className={inputClass} autoComplete="email" />
          </Field>
          <Field label="Order number (optional)">
            <input value={form.orderId} onChange={set("orderId")} placeholder="GS-4F2A9C" className={inputClass} />
          </Field>
          <Field label="Message" error={errors.message}>
            <textarea value={form.message} onChange={set("message")} rows={5} className={inputClass} />
          </Field>
          <button className="rounded bg-primary px-6 py-2.5 text-sm text-primary-foreground hover:opacity-90">
            Send message
          </button>
        </form>
      </main>
    </PageBackground>
  );
}

const inputClass = "w-full px-3 py-2 text-sm border border-border rounded bg-card";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}
