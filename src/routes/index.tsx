import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageBackground } from "@/components/site-chrome";
import { useCart } from "@/lib/cart";
import { CATEGORIES, GIFT_CARDS, cardGradient, money, priceLabel, type GiftCard } from "@/lib/shop-data";

type Sort = "default" | "price-asc" | "price-desc" | "name";

type ShopSearch = {
  q?: string;
  category?: string;
  min?: number;
  max?: number;
  sort?: Sort;
  page?: number;
};

const PER_PAGE = 12;

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
    category: typeof search.category === "string" && search.category ? search.category : undefined,
    min: Number.isFinite(Number(search.min)) && search.min !== undefined && search.min !== "" ? Number(search.min) : undefined,
    max: Number.isFinite(Number(search.max)) && search.max !== undefined && search.max !== "" ? Number(search.max) : undefined,
    sort: (["price-asc", "price-desc", "name"] as string[]).includes(String(search.sort))
      ? (search.sort as Sort)
      : undefined,
    page: Number(search.page) > 1 ? Number(search.page) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "GiftShop — Buy Digital Gift Cards Online" },
      {
        name: "description",
        content:
          "Browse digital gift cards for Amazon, Netflix, Steam, Spotify, Starbucks and more. Filter by price, pick a value and get the code by email.",
      },
      { property: "og:title", content: "GiftShop — Buy Digital Gift Cards Online" },
      { property: "og:description", content: "Digital gift cards for the brands you use, delivered by email in minutes." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [minInput, setMinInput] = useState(search.min?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(search.max?.toString() ?? "");
  const [sidebarTerm, setSidebarTerm] = useState(search.q ?? "");

  const update = (patch: Partial<ShopSearch>) =>
    navigate({ search: (prev: ShopSearch) => ({ ...prev, page: undefined, ...patch }) });

  const filtered = useMemo(() => {
    let list = GIFT_CARDS.filter((c) => {
      if (search.q && !`${c.name} ${c.description}`.toLowerCase().includes(search.q.toLowerCase())) return false;
      if (search.category && c.categorySlug !== search.category) return false;
      if (search.min !== undefined && c.priceMax < search.min) return false;
      if (search.max !== undefined && c.priceMin > search.max) return false;
      return true;
    });
    if (search.sort === "price-asc") list = [...list].sort((a, b) => a.priceMin - b.priceMin);
    if (search.sort === "price-desc") list = [...list].sort((a, b) => b.priceMin - a.priceMin);
    if (search.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [search.q, search.category, search.min, search.max, search.sort]);

  const page = search.page ?? 1;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof CATEGORIES>();
    for (const c of CATEGORIES) {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group)!.push(c);
    }
    return Array.from(map.entries());
  }, []);

  const activeCategory = search.category ? CATEGORIES.find((c) => c.slug === search.category) : undefined;
  const hasFilters = Boolean(search.q || search.category || search.min !== undefined || search.max !== undefined);

  return (
    <PageBackground>
      <main className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-3xl font-bold text-primary">{activeCategory ? activeCategory.name : "Shop"}</h2>
            <select
              value={search.sort ?? "default"}
              onChange={(e) => update({ sort: e.target.value === "default" ? undefined : (e.target.value as Sort) })}
              aria-label="Sort products"
              className="text-sm border border-border rounded px-2 py-1 bg-card"
            >
              <option value="default">Default sorting</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name: A–Z</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {visible.length ? (current - 1) * PER_PAGE + 1 : 0}–
              {(current - 1) * PER_PAGE + visible.length} of {filtered.length} results
            </p>
            {hasFilters && (
              <button
                onClick={() => navigate({ search: {} })}
                className="text-xs text-primary underline underline-offset-2"
              >
                Clear filters
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <p className="bg-card/90 border border-border rounded p-6 text-sm text-muted-foreground">
              No gift cards match those filters. Try widening the price range.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {visible.map((card) => (
                <ProductCard key={card.slug} card={card} />
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <div className="flex items-center gap-2 mt-8">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => navigate({ search: (prev: ShopSearch) => ({ ...prev, page: p === 1 ? undefined : p }) })}
                  className={`h-9 w-9 rounded border text-sm ${
                    p === current ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-8">
          <SidebarBlock title="FILTER BY PRICE">
            <div className="space-y-2">
              <input
                value={minInput}
                onChange={(e) => setMinInput(e.target.value)}
                inputMode="numeric"
                placeholder="Min"
                aria-label="Minimum price"
                className="w-full px-3 py-2 text-sm border border-border rounded bg-card"
              />
              <input
                value={maxInput}
                onChange={(e) => setMaxInput(e.target.value)}
                inputMode="numeric"
                placeholder="Max"
                aria-label="Maximum price"
                className="w-full px-3 py-2 text-sm border border-border rounded bg-card"
              />
              <button
                onClick={() =>
                  update({
                    min: minInput === "" ? undefined : Number(minInput),
                    max: maxInput === "" ? undefined : Number(maxInput),
                  })
                }
                className="text-primary border border-primary rounded px-4 py-1.5 text-sm hover:bg-primary hover:text-primary-foreground transition"
              >
                Filter
              </button>
            </div>
          </SidebarBlock>

          <CartBlock />

          <SidebarBlock title="SEARCH PRODUCTS">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                update({ q: sidebarTerm || undefined });
              }}
              className="flex"
            >
              <input
                value={sidebarTerm}
                onChange={(e) => setSidebarTerm(e.target.value)}
                aria-label="Search products"
                className="flex-1 min-w-0 px-3 py-2 text-sm border border-border rounded-l bg-card"
                placeholder="Search…"
              />
              <button className="px-4 bg-primary text-primary-foreground rounded-r text-sm">Search</button>
            </form>
          </SidebarBlock>

          <SidebarBlock title="PRODUCT CATEGORIES">
            <ul className="space-y-1.5 text-[15px]">
              {grouped.map(([label, items]) => (
                <li key={label}>
                  <div className="text-primary font-semibold">{label}</div>
                  <ul className="pl-4 space-y-1 mt-1">
                    {items.map((c) => (
                      <li key={c.slug}>
                        <button
                          onClick={() => update({ category: search.category === c.slug ? undefined : c.slug })}
                          className={`hover:underline ${
                            search.category === c.slug ? "text-primary font-semibold" : "text-primary/80 hover:text-primary"
                          }`}
                        >
                          {c.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </SidebarBlock>

          <SidebarBlock title="FEATURED CARDS">
            <ul className="space-y-3">
              {GIFT_CARDS.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link to="/product/$slug" params={{ slug: c.slug }} className="flex gap-3 items-center group">
                    <div className="h-12 w-16 rounded shrink-0 shadow" style={{ background: cardGradient(c.name) }} />
                    <div className="min-w-0">
                      <div className="text-primary text-sm font-semibold leading-tight truncate group-hover:underline">
                        {c.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{priceLabel(c)}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </SidebarBlock>
        </aside>
      </main>
    </PageBackground>
  );
}

function CartBlock() {
  const cart = useCart();
  return (
    <SidebarBlock title="CART">
      {cart.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Your cart is empty.</p>
      ) : (
        <div className="space-y-3">
          <ul className="space-y-2 text-sm">
            {cart.items.map((i) => (
              <li key={`${i.slug}-${i.amount}`} className="flex justify-between gap-2">
                <span className="truncate">
                  {i.quantity} × {i.name}
                </span>
                <span className="text-muted-foreground shrink-0">{money(i.amount * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
            <span>Subtotal</span>
            <span>{money(cart.total)}</span>
          </div>
          <Link
            to="/cart"
            className="block text-center text-primary border border-primary rounded px-3 py-1.5 text-sm hover:bg-primary hover:text-primary-foreground transition"
          >
            View cart
          </Link>
        </div>
      )}
    </SidebarBlock>
  );
}

function SidebarBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card/90 backdrop-blur rounded border border-border p-4">
      <h3 className="text-center text-sm tracking-wider text-foreground/80 pb-2 mb-3 border-b border-border">{title}</h3>
      {children}
    </div>
  );
}

function ProductCard({ card }: { card: GiftCard }) {
  return (
    <div className="bg-card/95 backdrop-blur rounded border border-border p-3 flex flex-col text-center hover:shadow-lg transition">
      <Link to="/product/$slug" params={{ slug: card.slug }}>
        <div
          className="aspect-[4/3] rounded overflow-hidden mb-3 relative"
          style={{ background: cardGradient(card.name) }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="text-primary-foreground text-lg font-bold px-3 py-1 tracking-wide"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              {card.name.split(" ")[0]}
            </div>
          </div>
        </div>
        <h3 className="text-primary font-semibold text-[15px] leading-snug min-h-[3rem]">{card.name}</h3>
      </Link>
      <p className="text-sm text-foreground/70 mt-1">{priceLabel(card)}</p>
      <Link
        to="/product/$slug"
        params={{ slug: card.slug }}
        className="mt-3 text-primary border border-primary rounded px-3 py-1.5 text-sm hover:bg-primary hover:text-primary-foreground transition"
      >
        Select options
      </Link>
    </div>
  );
}
