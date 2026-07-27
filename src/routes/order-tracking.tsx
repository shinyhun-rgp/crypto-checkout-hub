import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageBackground } from "@/components/site-chrome";
import { findOrder, loadOrders, type Order } from "@/lib/cart";
import { money } from "@/lib/shop-data";

type TrackSearch = { id?: string };

export const Route = createFileRoute("/order-tracking")({
  validateSearch: (search: Record<string, unknown>): TrackSearch => ({
    id: typeof search.id === "string" && search.id ? search.id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Order Tracking — GiftShop" },
      { name: "description", content: "Look up a GiftShop order by order number or email address and see its delivery status." },
      { property: "og:title", content: "Order Tracking — GiftShop" },
      { property: "og:description", content: "Check the status of your digital gift card order." },
    ],
  }),
  component: OrderTracking,
});

function OrderTracking() {
  const { id } = Route.useSearch();
  const navigate = useNavigate({ from: "/order-tracking" });
  const [query, setQuery] = useState(id ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setRecent(loadOrders());
    if (id) {
      setOrder(findOrder(id) ?? null);
      setSearched(true);
    }
  }, [id]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: { id: query.trim() || undefined } });
    setOrder(findOrder(query) ?? null);
    setSearched(true);
  };

  return (
    <PageBackground>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-3xl font-bold text-primary">Order tracking</h2>
        <p className="mt-3 text-foreground/70">
          Enter your order number (for example GS-4F2A9C) or the email address you ordered with.
        </p>

        <form onSubmit={submit} className="mt-6 flex flex-wrap gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order number or email"
            aria-label="Order number or email"
            className="flex-1 min-w-56 px-3 py-2 text-sm border border-border rounded bg-card"
          />
          <button className="rounded bg-primary px-5 py-2 text-sm text-primary-foreground hover:opacity-90">Track</button>
        </form>

        {searched && !order && (
          <p className="mt-6 bg-card/90 border border-border rounded p-5 text-sm text-muted-foreground">
            No order found for “{query}”. Orders placed in this browser appear here right after checkout.
          </p>
        )}

        {order && <OrderPanel order={order} />}

        {recent.length > 0 && (
          <section className="mt-12">
            <h3 className="text-xl font-bold text-primary">Recent orders</h3>
            <ul className="mt-4 space-y-2">
              {recent.map((o) => (
                <li key={o.id} className="bg-card/95 border border-border rounded p-4 flex flex-wrap justify-between gap-3">
                  <div>
                    <button
                      onClick={() => {
                        setQuery(o.id);
                        setOrder(o);
                        setSearched(true);
                        navigate({ search: { id: o.id } });
                      }}
                      className="text-primary font-semibold hover:underline"
                    >
                      {o.id}
                    </button>
                    <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="text-sm font-semibold">{money(o.total)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {recent.length === 0 && (
          <p className="mt-10 text-sm text-muted-foreground">
            No orders yet —{" "}
            <Link to="/" className="text-primary underline">
              pick a gift card
            </Link>{" "}
            to get started.
          </p>
        )}
      </main>
    </PageBackground>
  );
}

const STEPS = ["Order received", "Payment confirmed", "Codes issued", "Delivered"];

function OrderPanel({ order }: { order: Order }) {
  const minutesOld = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
  const stage = minutesOld > 6 ? 3 : minutesOld > 3 ? 2 : minutesOld > 1 ? 1 : 0;

  return (
    <section className="mt-8 bg-card/95 border border-border rounded p-6">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Order</p>
          <p className="text-2xl font-bold text-primary">{order.id}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="font-semibold">{stage === 3 ? "Delivered" : "Processing"}</p>
        </div>
      </div>

      <ol className="mt-6 grid gap-3 sm:grid-cols-4">
        {STEPS.map((step, i) => (
          <li key={step} className="flex items-center gap-2 text-sm">
            <span
              className={`h-2.5 w-2.5 rounded-full ${i <= stage ? "bg-primary" : "bg-border"}`}
              aria-hidden
            />
            <span className={i <= stage ? "text-foreground" : "text-muted-foreground"}>{step}</span>
          </li>
        ))}
      </ol>

      <ul className="mt-6 space-y-1 text-sm border-t border-border pt-4">
        {order.items.map((i) => (
          <li key={`${i.slug}-${i.amount}`} className="flex justify-between">
            <span>
              {i.quantity} × {i.name} (${i.amount})
            </span>
            <span>{money(i.amount * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex justify-between font-semibold border-t border-border pt-3">
        <span>Total</span>
        <span>{money(order.total)}</span>
      </p>
      {order.payment && (
        <dl className="mt-3 border-t border-border pt-3 space-y-1 text-sm">
          <div className="flex flex-wrap justify-between gap-3">
            <dt className="text-muted-foreground">Paid in</dt>
            <dd>
              {order.payment.cryptoAmount} {order.payment.coin} ({order.payment.network})
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-3">
            <dt className="text-muted-foreground">Transaction</dt>
            <dd className="font-mono text-xs break-all">{order.payment.txHash}</dd>
          </div>
        </dl>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        Delivery to {order.email} by {order.method === "email" ? "email" : "SMS"}.
      </p>
    </section>
  );
}
