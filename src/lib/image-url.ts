const DIRECT_IMAGE_EXTENSIONS = /\.(avif|gif|jpe?g|png|svg|webp)(?:$|[?#])/i;

const RESOLVABLE_PAGE_HOSTS = new Set(["ibb.co", "www.ibb.co", "imgbb.com", "www.imgbb.com"]);

export function normalizeImageUrl(imageUrl: string | null | undefined): string | null {
  const trimmed = (imageUrl ?? "").trim();
  if (!trimmed) return null;
  return trimmed;
}

export function isDirectImageUrl(imageUrl: string): boolean {
  return DIRECT_IMAGE_EXTENSIONS.test(imageUrl);
}

export function isResolvableImagePage(imageUrl: string): boolean {
  try {
    const parsed = new URL(imageUrl);
    return RESOLVABLE_PAGE_HOSTS.has(parsed.hostname.toLowerCase()) && !isDirectImageUrl(parsed.href);
  } catch {
    return false;
  }
}

export function productImageSource(imageUrl: string | null | undefined): string | null {
  const normalized = normalizeImageUrl(imageUrl);
  if (!normalized) return null;

  if (isResolvableImagePage(normalized)) {
    return `/api/public/resolve-image?url=${encodeURIComponent(normalized)}`;
  }

  return normalized;
}