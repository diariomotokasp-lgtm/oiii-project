import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { checkBasicAuth, unauthorizedResponse } from "./lib/access-gate";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Private access gate: protects every page and every server function on the published site.
// No in-app login. The Lovable editor preview (dev server) is already private, so it is skipped there.
// Fails closed: without APP_ACCESS_PASSWORD configured, the published site refuses all requests.
const accessGateMiddleware = createMiddleware().server(async ({ next, request }) => {
  if (import.meta.env.DEV) return next();
  const pass = process.env["APP_ACCESS_PASSWORD"];
  const user = process.env["APP_ACCESS_USER"] || "jonathan";
  if (!pass) {
    return new Response("Acesso privado ainda não configurado.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }
  if (!checkBasicAuth(request.headers.get("authorization"), user, pass)) {
    return unauthorizedResponse();
  }
  return next();
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

// requestMiddleware runs on every request. This app has no user accounts by design
// (single owner), so the generated Supabase bearer attacher is intentionally not registered:
// all database access goes through server functions behind accessGateMiddleware.
export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, accessGateMiddleware, csrfMiddleware],
}));
