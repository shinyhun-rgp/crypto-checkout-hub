import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageBackground } from "@/components/site-chrome";
import { useCart, type Order } from "@/lib/cart";
import { money } from "@/lib/shop-data";
import {
  COINS,
  INVOICE_WINDOW_SECONDS,
  formatRate,
  getCoin,
  mockTxHash,
  quote,
  type CoinId,
} from "@/lib/crypto-payment";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Crypto Checkout — GiftShop" },
      {
        name: "description",
        content: "Pay for your digital gift cards with Bitcoin, Ethereum, USDT, Litecoin or Solana.",
      },
      { property: "og:title", content: "Crypto Checkout — GiftShop" },
      { property: "og:description", content: "Crypto-only checkout for digital gift card codes." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const cart = useCart();
  const [step, setStep] = useState<"details" | "pay">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"email" | "sms">("email");
  const [coinId, setCoinId] = useState<CoinId>("BTC");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placed, setPlaced] = useState<Order | null>(null);

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Please enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setStep("pay");
  };

  const confirmPayment = (cryptoAmount: string) => {
    const coin = getCoin(coinId);
    setPlaced(
      cart.placeOrder({
        name: name.trim(),
        email: email.trim(),
        method,
        payment: {
          coin: coin.id,
          network: coin.network,
          address: coin.address,
          cryptoAmount,
          txHash: mockTxHash(coin.id),
          paidAt: new Date().toISOString(),
        },
      }),
    );
  };

  if (placed) {
    return (
      <PageBackground>
        <main className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-primary">Payment received</h2>
          <p className="mt-3 text-foreground/70">
            Thanks {placed.name}. Once the network confirms your transfer, your codes are sent to {placed.email}.
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
            <dl className="mt-4 border-t border-border pt-3 space-y-1 text-sm">
              <Row label="Paid in">
                {placed.payment.cryptoAmount} {placed.payment.coin} ({placed.payment.network})
              </Row>
              <Row label="Transaction">
                <span className="font-mono text-xs break-all">{placed.payment.txHash}</span>
              </Row>
            </dl>
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
          <p className="mt-2 text-sm text-muted-foreground">
            We accept cryptocurrency only — no cards, no bank transfers.
          </p>
          {cart.items.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Your cart is empty.{" "}
              <Link to="/" className="text-primary underline">
                Browse gift cards
              </Link>
              .
            </p>
          ) : step === "details" ? (
            <form onSubmit={submitDetails} className="mt-6 space-y-5">
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
              <fieldset>
                <legend className="text-sm font-semibold">Pay with</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {COINS.map((c) => (
                    <label
                      key={c.id}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded border px-3 py-2 text-sm ${
                        coinId === c.id ? "border-primary bg-primary/5" : "border-border bg-card"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="coin"
                          checked={coinId === c.id}
                          onChange={() => setCoinId(c.id)}
                        />
                        <span className="font-semibold">{c.id}</span>
                        <span className="text-muted-foreground">{c.name}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{c.network}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <button className="rounded bg-primary px-6 py-2.5 text-sm text-primary-foreground hover:opacity-90">
                Continue to payment — {money(cart.total)}
              </button>
            </form>
          ) : (
            <CryptoInvoice
              coinId={coinId}
              total={cart.total}
              onBack={() => setStep("details")}
              onConfirm={confirmPayment}
            />
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
          {cart.items.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              ≈ {quote(cart.total, coinId)} {coinId} · {formatRate(coinId)}
            </p>
          )}
        </aside>
      </main>
    </PageBackground>
  );
}

function CryptoInvoice({
  coinId,
  total,
  onBack,
  onConfirm,
}: {
  coinId: CoinId;
  total: number;
  onBack: () => void;
  onConfirm: (cryptoAmount: string) => void;
}) {
  const coin = getCoin(coinId);
  const amount = useMemo(() => quote(total, coinId), [total, coinId]);
  const [secondsLeft, setSecondsLeft] = useState(INVOICE_WINDOW_SECONDS);
  const [copied, setCopied] = useState(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const expired = secondsLeft === 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coin.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const confirm = () => {
    setWaiting(true);
    setTimeout(() => onConfirm(amount), 1600);
  };

  return (
    <div className="mt-6 space-y-5">
      <div className="rounded border border-border bg-card/95 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-primary">
            Send {coin.name} ({coin.network})
          </h3>
          <span className={`text-sm font-mono ${expired ? "text-destructive" : "text-muted-foreground"}`}>
            {expired ? "Quote expired" : `Expires in ${mm}:${ss}`}
          </span>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Amount due">
            <span className="font-mono font-semibold">
              {amount} {coin.id}
            </span>
          </Row>
          <Row label="Order value">{money(total)}</Row>
          <Row label="Rate">{formatRate(coin.id)}</Row>
          <Row label="Confirmations">{coin.confirmations} network confirmations</Row>
        </dl>

        <div className="mt-4">
          <p className="text-sm font-semibold">Deposit address</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <code className="flex-1 min-w-56 break-all rounded border border-border bg-background px-3 py-2 font-mono text-xs">
              {coin.address}
            </code>
            <button
              type="button"
              onClick={copy}
              className="rounded border border-primary px-3 py-2 text-xs text-primary hover:bg-primary hover:text-primary-foreground transition"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Send only {coin.id} on the {coin.network} network. Funds sent on any other network are unrecoverable.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={confirm}
          disabled={expired || waiting}
          className="rounded bg-primary px-6 py-2.5 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {waiting ? "Checking the blockchain…" : "I've sent the payment"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="rounded border border-border px-5 py-2.5 text-sm hover:bg-accent"
        >
          Back
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Demo checkout: no real blockchain transfer is broadcast and codes are simulated.
      </p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
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
