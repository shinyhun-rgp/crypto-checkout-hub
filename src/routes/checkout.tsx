import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageBackground } from "@/components/site-chrome";
import { useCart, type Order } from "@/lib/cart";
import { money } from "@/lib/shop-data";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — GiftShop" },
      { name: "description", content: "Enter your delivery details and place your digital gift card order." },
      { property: "og:title", content: "Checkout — GiftShop" },
      { property: "og:description", content: "Place your digital gift card order in a few seconds." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const cart = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"email" | "sms">("email");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placed, setPlaced] = useState<Order | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Please enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setPlaced(cart.placeOrder({ name: name.trim(), email: email.trim(), method }));
  };

  if (placed) {
    return (
      <PageBackground>
        <main className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-primary">Order confirmed</h2>
          <p className="mt-3 text-foreground/70">
            Thanks {placed.name}. Your codes are on the way to {placed.email}.
          </p>
          <div className="mt-6 bg-card/95 border border-border rounded p-6 text-left">
            <p className="text-sm text-muted-foreground">Order number</p>
            <p className="text-2xl font-bold text-primary tracking-wide">{placed.id}</p>
            <ul className="mt-4 space-y-1 text-sm">
              {placed.items.map((i) => (
                <li key={`${i.slug}-${i.amount}`} className="flex justify-between">
                  <span>
                    {i.quantity} × {i.name} (${i.amount})
                  </span>
                  <span>{money(i.amount * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-border pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>{money(placed.total)}</span>
            </p>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/order-tracking"
              search={{ id: placed.id }}
              className="rounded bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90"
            >
              Track this order
            </Link>
            <Link
              to="/"
              className="rounded border border-primary px-5 py-2.5 text-sm text-primary hover:bg-primary hover:text-primary-foreground transition"
            >
              Keep shopping
            </Link>
          </div>
        </main>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <main className="mx-auto max-w-4xl px-6 py-12 grid gap-10 md:grid-cols-[1fr_300px]">
        <section>
          <h2 className="text-3xl font-bold text-primary">Checkout</h2>
          {cart.items.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Your cart is empty.{" "}
              <Link to="/" className="text-primary underline">
                Browse gift cards
              </Link>
              .
            </p>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-5">
              <Field label="Full name" error={errors.name}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded bg-card"
                  autoComplete="name"
                />
              </Field>
              <Field label="Email address" error={errors.email}>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="w-full px-3 py-2 text-sm border border-border rounded bg-card"
                  autoComplete="email"
                />
              </Field>
              <fieldset>
                <legend className="text-sm font-semibold">Delivery method</legend>
                <div className="mt-2 flex gap-4 text-sm">
                  {(["email", "sms"] as const).map((m) => (
                    <label key={m} className="flex items-center gap-2">
                      <input type="radio" checked={method === m} onChange={() => setMethod(m)} />
                      {m === "email" ? "Email delivery" : "SMS delivery"}
                    </label>
                  ))}
                </div>
              </fieldset>
              <button className="rounded bg-primary px-6 py-2.5 text-sm text-primary-foreground hover:opacity-90">
                Place order — {money(cart.total)}
              </button>
              <p className="text-xs text-muted-foreground">
                Demo checkout: no payment is taken and codes are simulated.
              </p>
            </form>
          )}
        </section>

        <aside className="bg-card/95 border border-border rounded p-5 h-fit">
          <h3 className="font-semibold text-primary">Order summary</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {cart.items.map((i) => (
              <li key={`${i.slug}-${i.amount}`} className="flex justify-between gap-3">
                <span className="truncate">
                  {i.quantity} × {i.name}
                </span>
                <span>{money(i.amount * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-border pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>{money(cart.total)}</span>
          </p>
        </aside>
      </main>
    </PageBackground>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}
