import { createFileRoute } from "@tanstack/react-router";
import { InfoCard, InfoPage } from "@/components/site-chrome";

export const Route = createFileRoute("/delivery-method")({
  head: () => ({
    meta: [
      { title: "Delivery Method — GiftShop" },
      { name: "description", content: "Choose email or SMS delivery for your gift card codes, and see how each option works." },
      { property: "og:title", content: "Delivery Method — GiftShop" },
      { property: "og:description", content: "Email or SMS delivery for every digital gift card code." },
    ],
  }),
  component: () => (
    <InfoPage title="Delivery method" lead="Pick how your codes arrive when you check out.">
      <InfoCard title="Email delivery (default)">
        <p>
          Codes arrive as a formatted email with the card value, the redemption code and a link to the issuer's
          redemption page. Emails are re-sendable from the order tracking page.
        </p>
      </InfoCard>
      <InfoCard title="SMS delivery">
        <p>
          Select SMS at checkout to receive the code as a text message instead. Useful when the card is a last-minute
          gift and the recipient is not at a computer.
        </p>
      </InfoCard>
      <InfoCard title="Sending to someone else">
        <p>
          Enter the recipient's email at checkout instead of your own. The order confirmation still goes to the
          purchasing address so you keep the receipt.
        </p>
      </InfoCard>
    </InfoPage>
  ),
});
