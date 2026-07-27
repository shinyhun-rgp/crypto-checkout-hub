import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { PageBackground } from "@/components/site-chrome";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/shop-data";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — GiftShop" },
      { name: "description", content: "Review the gift cards in your cart, adjust quantities and continue to checkout." },
      { property: "og:title", content: "Your Cart — GiftShop" },
      { property: "og:description", content: "Review your gift card selection before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();

  return (
    <PageBackground>
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-3xl font-bold text-primary">Your cart</h2>

        {!cart.hydrated ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading cart…</p>
        ) : cart.items.length === 0 ? (
          <div className="mt-6 bg-card/90 border border-border rounded p-8 text-center">
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Link
              to="/"
              className="mt-4 inline-block bg-primary text-primary-foreground rounded px-5 py-2 text-sm hover:opacity-90"
            >
              Browse gift cards
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-6 space-y-3">
              {cart.items.map((item) => (
                <li
                  key={`${item.slug}-${item.amount}`}
                  className="bg-card/95 border border-border rounded p-4 flex flex-wrap items-center gap-4"
                >
                  <div className="flex-1 min-w-40">
                    <Link to="/product/$slug" params={{ slug: item.slug }} className="text-primary font-semibold hover:underline">
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">Card value ${item.amount}</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={item.quantity}
                    aria-label={`Quantity for ${item.name}`}
                    onChange={(e) => cart.setQuantity(item.slug, item.amount, Number(e.target.value) || 0)}
                    className="w-20 px-3 py-2 text-sm border border-border rounded bg-card"
                  />
                  <span className="w-24 text-right font-semibold">{money(item.amount * item.quantity)}</span>
                  <button
                    onClick={() => cart.remove(item.slug, item.amount)}
                    aria-label={`Remove ${item.name}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
              <button onClick={cart.clear} className="text-sm text-muted-foreground hover:text-destructive underline">
                Empty cart
              </button>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Order total</p>
                <p className="text-2xl font-bold text-primary">{money(cart.total)}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              <Link to="/" className="rounded border border-primary px-5 py-2.5 text-sm text-primary hover:bg-primary hover:text-primary-foreground transition">
                Continue shopping
              </Link>
              <Link to="/checkout" className="rounded bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90">
                Proceed to checkout
              </Link>
            </div>
          </>
        )}
      </main>
    </PageBackground>
  );
}
