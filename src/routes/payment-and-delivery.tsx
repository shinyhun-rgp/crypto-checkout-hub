import { createFileRoute } from "@tanstack/react-router";
import { InfoCard, InfoPage } from "@/components/site-chrome";

export const Route = createFileRoute("/payment-and-delivery")({
  head: () => ({
    meta: [
      { title: "Payment and Delivery — GiftShop" },
      { name: "description", content: "GiftShop accepts cryptocurrency only — pay with BTC, ETH, USDT, LTC or SOL and get your codes after confirmation." },
      { property: "og:title", content: "Payment and Delivery — GiftShop" },
      { property: "og:description", content: "Crypto-only payments and how gift card codes reach you." },
    ],
  }),
  component: () => (
    <InfoPage
      title="Payment and delivery"
      lead="We are a crypto-only storefront. Here is how paying and receiving your codes works."
    >
      <InfoCard title="Accepted payment methods">
        <p>Cryptocurrency is the only payment method we accept. No cards, PayPal or bank transfers.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Bitcoin (BTC) — Bitcoin network</li>
          <li>Ethereum (ETH) — ERC-20</li>
          <li>Tether (USDT) — TRC-20</li>
          <li>Litecoin (LTC) — Litecoin network</li>
          <li>Solana (SOL) — Solana network</li>
        </ul>
      </InfoCard>
      <InfoCard title="How a crypto payment works">
        <p>
          At checkout you pick a coin and we quote the exact amount at the live rate. The quote and deposit address
          stay valid for 15 minutes. Send the exact amount on the stated network — coins sent on the wrong network
          cannot be recovered.
        </p>
        <p>Your order moves to “Payment confirmed” once the required number of network confirmations is reached.</p>
      </InfoCard>
      <InfoCard title="How delivery works">
        <p>
          Once the transaction confirms on-chain, each card code is generated and sent to the email address on your order. Nothing
          is shipped physically — every product here is a digital code.
        </p>
      </InfoCard>
      <InfoCard title="Refunds">
        <p>
          Unredeemed codes can be refunded within 14 days of purchase. Refunds are returned in the same coin you paid
          with, to a wallet address you provide, minus the network fee. Once a code has been redeemed with the issuing
          brand it can no longer be refunded.
        </p>
      </InfoCard>
    </InfoPage>
  ),
});
