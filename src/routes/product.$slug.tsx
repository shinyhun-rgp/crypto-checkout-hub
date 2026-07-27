import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { PageBackground } from "@/components/site-chrome";
import { useCart } from "@/lib/cart";
import { CATEGORIES, GIFT_CARDS, cardGradient, getCard, money, priceLabel } from "@/lib/shop-data";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const card = getCard(params.slug);
    if (!card) throw notFound();
    return { card };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Gift card unavailable — GiftShop" }, { name: "robots", content: "noindex" }] };
    }
    const { card } = loaderData;
    const title = `${card.name} — ${priceLabel(card)} | GiftShop`;
    return {
      meta: [
        { title },
        { name: "description", content: `${card.description} Choose a value from ${priceLabel(card)} and get the code by email.` },
        { property: "og:title", content: title },
        { property: "og:description", content: card.description },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { card } = Route.useLoaderData();
  const cart = useCart();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(card.denominations[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const category = CATEGORIES.find((c) => c.slug === card.categorySlug);
  const related = GIFT_CARDS.filter((c) => c.categorySlug === card.categorySlug && c.slug !== card.slug).slice(0, 4);

  const addToCart = () => {
    cart.add({ slug: card.slug, name: card.name, amount, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <PageBackground>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <button
          onClick={() => window.history.length > 1 ? window.history.back() : navigate({ to: "/" })}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <nav aria-label="Breadcrumb" className="mt-3 text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">
            Shop
          </Link>
          {category && (
            <>
              {" / "}
              <Link to="/" search={{ category: category.slug }} className="hover:underline">
                {category.name}
              </Link>
            </>
          )}
          {" / "}
          <span className="text-foreground/70">{card.name}</span>
        </nav>

        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div
            className="aspect-[4/3] rounded-lg shadow-lg flex items-center justify-center"
            style={{ background: cardGradient(card.name) }}
          >
            <span className="text-primary-foreground text-3xl" style={{ fontFamily: "var(--font-brand)" }}>
              {card.name.split(" ")[0]}
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-primary">{card.name}</h2>
            <p className="mt-1 text-lg text-foreground/70">{priceLabel(card)}</p>
            <p className="mt-4 text-sm text-foreground/75">{card.description}</p>

            <div className="mt-6">
              <span className="text-sm font-semibold">Card value</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {card.denominations.map((d: number) => (
                  <button
                    key={d}
                    onClick={() => setAmount(d)}
                    className={`px-3 py-1.5 rounded border text-sm transition ${
                      d === amount
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-card hover:border-primary"
                    }`}
                  >
                    ${d}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <label htmlFor="qty" className="text-sm font-semibold">
                Quantity
              </label>
              <input
                id="qty"
                type="number"
                min={1}
                max={20}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                className="w-20 px-3 py-2 text-sm border border-border rounded bg-card"
              />
            </div>

            <p className="mt-6 text-lg font-semibold">Total: {money(amount * quantity)}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={addToCart}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded px-5 py-2.5 text-sm font-medium hover:opacity-90"
              >
                {added ? <Check className="h-4 w-4" /> : null}
                {added ? "Added to cart" : "Add to cart"}
              </button>
              <button
                onClick={() => {
                  cart.add({ slug: card.slug, name: card.name, amount, quantity });
                  navigate({ to: "/checkout" });
                }}
                className="rounded border border-primary px-5 py-2.5 text-sm text-primary hover:bg-primary hover:text-primary-foreground transition"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h3 className="text-xl font-bold text-primary">Related cards</h3>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((c) => (
                <Link
                  key={c.slug}
                  to="/product/$slug"
                  params={{ slug: c.slug }}
                  className="bg-card/95 border border-border rounded p-3 text-center hover:shadow-lg transition"
                >
                  <div className="aspect-[4/3] rounded mb-3" style={{ background: cardGradient(c.name) }} />
                  <div className="text-primary font-semibold text-sm">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{priceLabel(c)}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </PageBackground>
  );
}
