import { createFileRoute } from "@tanstack/react-router";
import { InfoCard, InfoPage } from "@/components/site-chrome";

export const Route = createFileRoute("/delivery-time")({
  head: () => ({
    meta: [
      { title: "Delivery Time — GiftShop" },
      { name: "description", content: "How fast GiftShop gift card codes arrive, typical processing windows and what to do if a code is late." },
      { property: "og:title", content: "Delivery Time — GiftShop" },
      { property: "og:description", content: "Most gift card codes arrive within minutes of payment." },
    ],
  }),
  component: () => (
    <InfoPage title="Delivery time" lead="Most orders complete within minutes, not days.">
      <InfoCard title="Typical timings">
        <ul className="list-disc pl-5 space-y-1">
          <li>Payment confirmation — under 1 minute</li>
          <li>Code issued — 1 to 5 minutes</li>
          <li>Email or SMS received — within 10 minutes</li>
        </ul>
      </InfoCard>
      <InfoCard title="Higher value cards">
        <p>
          Orders over $500 go through an extra verification step, which can add up to 2 hours during busy periods.
          Track progress at any time from the order tracking page.
        </p>
      </InfoCard>
      <InfoCard title="Code hasn't arrived?">
        <p>
          Check your spam folder first, then look up the order number on the order tracking page. If the status shows
          "Codes issued" but nothing arrived, contact support and we will resend it.
        </p>
      </InfoCard>
    </InfoPage>
  ),
});
