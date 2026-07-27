import { createFileRoute } from "@tanstack/react-router";
import { InfoCard, InfoPage } from "@/components/site-chrome";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About GiftShop — Digital Gift Card Store" },
      { name: "description", content: "GiftShop is a digital gift card store offering instant email delivery for Amazon, Netflix, Steam, Spotify and dozens more brands." },
      { property: "og:title", content: "About GiftShop" },
      { property: "og:description", content: "Who we are and how our digital gift card store works." },
    ],
  }),
  component: () => (
    <InfoPage title="About us" lead="A small team that makes buying gift cards fast and boring — in a good way.">
      <InfoCard title="What we do">
        <p>
          GiftShop sells digital gift cards from major retail, entertainment and food brands. Every product is a code,
          so there is nothing to ship and nothing to wait for.
        </p>
      </InfoCard>
      <InfoCard title="Why buy here">
        <ul className="list-disc pl-5 space-y-1">
          <li>Over 20 brands in one catalogue with a single checkout</li>
          <li>Flexible card values from $10 up to $1,000</li>
          <li>Order tracking on every purchase</li>
        </ul>
      </InfoCard>
      <InfoCard title="Support">
        <p>Questions about an order go to hello@giftshop.example — replies usually land the same business day.</p>
      </InfoCard>
    </InfoPage>
  ),
});
