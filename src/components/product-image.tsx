import { useEffect, useState } from "react";
import { productImageSource } from "@/lib/image-url";
import { productGradient } from "@/lib/store";

export function ProductImage({
  imageUrl,
  name,
  className,
}: {
  imageUrl: string | null | undefined;
  name: string;
  className?: string;
}) {
  const src = productImageSource(imageUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`} style={{ background: productGradient(name) }}>
      {src && !failed ? (
        <img
          src={src}
          alt={`${name} product image`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : null}
    </div>
  );
}