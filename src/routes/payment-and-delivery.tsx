import { createFileRoute } from "@tanstack/react-router";
import { InfoCard, InfoPage } from "@/components/site-chrome";

export const Route = createFileRoute("/payment-and-delivery")({
  head: () => ({
    meta: [
      { title: "Payment and Delivery — GiftShop" },
      { name: "description", content: "How to pay for digital gift cards at GiftShop and how your codes are delivered after checkout." },
      { property: "og:title", content: "Payment and Delivery — GiftShop" },
      { property: "og:description", content: "Accepted payment methods and how gift card codes reach you." },
    ],
  }),
  component: () => (
    <InfoPage
      title="Payment and delivery"
      lead="Everything about paying for your cards and receiving the codes."
    >
      <InfoCard title="Accepted payment methods">
        <ul className="list-disc pl-5 space-y-1">
          <li>Visa, Mastercard and American Express</li>
          <li>Apple Pay and Google Pay</li>
          <li>PayPal</li>
        </ul>
        <p>This demo storefront does not capture real payment details at checkout.</p>
      </InfoCard>
      <InfoCard title="How delivery works">
        <p>
          Once payment is confirmed, each card code is generated and sent to the email address on your order. Nothing
          is shipped physically — every product here is a digital code.
        </p>
      </InfoCard>
      <InfoCard title="Refunds">
        <p>
          Unredeemed codes can be refunded within 14 days of purchase. Once a code has been redeemed with the issuing
          brand it can no longer be refunded.
        </p>
      </InfoCard>
    </InfoPage>
  ),
});
