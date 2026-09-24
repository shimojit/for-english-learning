interface Env { ASSETS: Fetcher; API: Fetcher }
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname.startsWith('/api/')) {
      try { return await env.API.fetch(request); }
      catch { return Response.json({ error: 'API is unavailable' }, { status: 503 }); }
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
