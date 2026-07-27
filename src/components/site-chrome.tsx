import { Link, useNavigate } from "@tanstack/react-router";
import { Mail, Search, ShoppingCart } from "lucide-react";
import { useState, type ReactNode } from "react";
import leavesBg from "@/assets/leaves-bg.jpg";
import { CATEGORIES, SETTINGS, money } from "@/lib/shop-data";
import { useCart } from "@/lib/cart";

const NAV = [
  { label: "HOME", to: "/" },
  { label: "ORDER TRACKING", to: "/order-tracking" },
  { label: "PAYMENT AND DELIVERY", to: "/payment-and-delivery" },
  { label: "DELIVERY METHOD", to: "/delivery-method" },
  { label: "DELIVERY TIME", to: "/delivery-time" },
  { label: "ABOUT US", to: "/about" },
  { label: "CONTACT US", to: "/contact" },
] as const;

export function SiteHeader() {
  const navigate = useNavigate();
  const cart = useCart();
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("all");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/", search: { q: term || undefined, category: category === "all" ? undefined : category } });
  };

  return (
    <header className="relative">
      <div
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.55), rgba(255,255,255,0.55)), url(${leavesBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <Link to="/" className="inline-block">
              <h1 className="text-5xl md:text-6xl leading-none text-primary" style={{ fontFamily: "var(--font-brand)" }}>
                {SETTINGS.brandName}
              </h1>
            </Link>
            <p className="mt-3 text-primary font-semibold max-w-sm">{SETTINGS.tagline}</p>
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" /> {SETTINGS.email}
            </p>
          </div>

          <form onSubmit={submit} className="flex-1 max-w-xl w-full">
            <div className="flex items-stretch bg-card border border-border rounded overflow-hidden shadow-sm">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Category"
                className="px-3 text-sm bg-muted border-r border-border outline-none"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search gift cards..."
                aria-label="Search gift cards"
                className="flex-1 px-3 py-2 text-sm outline-none bg-card"
              />
              <button type="submit" className="px-4 bg-primary text-primary-foreground" aria-label="Search">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          <Link to="/cart" className="flex items-center gap-2 text-primary hover:opacity-80">
            <span className="relative">
              <ShoppingCart className="h-6 w-6" />
              {cart.count > 0 && (
                <span className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] leading-4 text-center">
                  {cart.count}
                </span>
              )}
            </span>
            <span className="text-sm font-semibold">{money(cart.total)}</span>
          </Link>
        </div>
      </div>

      <nav className="bg-card/95 backdrop-blur border-y border-border">
        <ul className="mx-auto max-w-7xl px-6 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] tracking-wide text-foreground/80">
          {NAV.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary border-primary" }}
                className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/80 backdrop-blur mt-10">
      <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>{SETTINGS.footer}</p>
        <div className="flex gap-4">
          <Link to="/payment-and-delivery" className="text-primary hover:underline">
            Payment
          </Link>
          <Link to="/order-tracking" className="text-primary hover:underline">
            Track order
          </Link>
          <Link to="/contact" className="text-primary hover:underline">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function PageBackground({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative flex flex-col">
      <div
        aria-hidden
        className="fixed inset-0 -z-10 opacity-40"
        style={{ backgroundImage: `url(${leavesBg})`, backgroundSize: "600px" }}
      />
      <div aria-hidden className="fixed inset-0 -z-10 bg-background/60" />
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}

/** Simple content page shell used by the informational routes. */
export function InfoPage({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <PageBackground>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-3xl font-bold text-primary">{title}</h2>
        {lead && <p className="mt-3 text-foreground/70">{lead}</p>}
        <div className="mt-8 space-y-6">{children}</div>
      </main>
    </PageBackground>
  );
}

export function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-card/90 backdrop-blur border border-border rounded p-5">
      <h3 className="font-semibold text-primary">{title}</h3>
      <div className="mt-2 text-sm text-foreground/75 space-y-2">{children}</div>
    </section>
  );
}
