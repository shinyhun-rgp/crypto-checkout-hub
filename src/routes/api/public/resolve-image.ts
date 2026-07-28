import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_PAGE_HOSTS = new Set(["ibb.co", "www.ibb.co", "imgbb.com", "www.imgbb.com"]);
const DIRECT_IMAGE_EXTENSIONS = /\.(avif|gif|jpe?g|png|svg|webp)(?:$|[?#])/i;

export const Route = createFileRoute("/api/public/resolve-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const raw = url.searchParams.get("url");
        const target = parseAllowedTarget(raw);

        if (!target) {
          return new Response("Unsupported image URL", { status: 400 });
        }

        if (DIRECT_IMAGE_EXTENSIONS.test(target.href)) {
          return redirectTo(target.href);
        }

        const response = await fetch(target.href, {
          headers: {
            accept: "text/html,application/xhtml+xml",
            "user-agent": "Mozilla/5.0 (compatible; image-resolver/1.0)",
          },
        });

        if (!response.ok) {
          return new Response("Image host did not respond", { status: 502 });
        }

        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.toLowerCase().startsWith("image/")) {
          return redirectTo(target.href);
        }

        const html = await response.text();
        const resolved = extractImageUrl(html, target.href);

        if (!resolved) {
          return new Response("No direct image found", { status: 404 });
        }

        return redirectTo(resolved);
      },
    },
  },
});

function parseAllowedTarget(raw: string | null): URL | null {
  if (!raw) return null;

  try {
    const target = new URL(raw.trim());
    if (target.protocol !== "https:" && target.protocol !== "http:") return null;
    if (!ALLOWED_PAGE_HOSTS.has(target.hostname.toLowerCase())) return null;
    return target;
  } catch {
    return null;
  }
}

function extractImageUrl(html: string, baseUrl: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    const value = match?.[1];
    if (!value) continue;

    const decoded = decodeHtmlAttribute(value);
    try {
      const resolved = new URL(decoded, baseUrl);
      if (resolved.protocol === "https:" || resolved.protocol === "http:") return resolved.href;
    } catch {
      continue;
    }
  }

  return null;
}

function decodeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#x2F;", "/")
    .replaceAll("&#47;", "/")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function redirectTo(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      location,
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}