interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * URL parsing & building MCP.
 *
 * Keyless, offline: parse a URL into its components (with query params broken
 * out), build a URL from parts, and parse/stringify query strings. Uses the
 * platform URL/URLSearchParams — no API, no key.
 */


const tools: McpToolExport['tools'] = [
  {
    name: 'parse_url',
    description: 'Parse a URL into its components (keyless, offline): protocol, host, hostname, port, path, query (as an object), fragment, origin, and any userinfo.',
    inputSchema: { type: 'object', properties: { url: { type: 'string', description: 'A full URL, e.g. "https://user@example.com:8443/a/b?x=1&y=2#frag".' } }, required: ['url'] },
  },
  {
    name: 'build_url',
    description: 'Build a URL string from components. Provide at least `hostname` (and optionally protocol, port, path, hash) plus a `query` object of key/value pairs.',
    inputSchema: {
      type: 'object',
      properties: {
        protocol: { type: 'string', description: 'e.g. "https" (default).' },
        hostname: { type: 'string', description: 'Host, e.g. "example.com".' },
        port: { type: 'number', description: 'Optional port.' },
        path: { type: 'string', description: 'Path, e.g. "/search" (default "/").' },
        query: { type: 'object', description: 'Query parameters as an object, e.g. {"q":"cats","page":2}.' },
        hash: { type: 'string', description: 'Optional fragment (without "#").' },
      },
      required: ['hostname'],
    },
  },
  {
    name: 'parse_query',
    description: 'Parse a query string (with or without a leading "?") into an object; repeated keys become arrays.',
    inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'e.g. "a=1&b=2&b=3".' } }, required: ['query'] },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'parse_url': {
      const raw = reqStr(args, 'url', '"https://example.com/a?x=1"');
      let u: URL;
      try { u = new URL(raw); } catch { return { input: raw, valid: false, reason: 'Not a valid absolute URL (include the scheme, e.g. https://).' }; }
      const query: Record<string, string | string[]> = {};
      for (const [k, v] of u.searchParams) query[k] = k in query ? ([] as string[]).concat(query[k] as any, v) : v;
      return {
        input: raw, valid: true,
        protocol: u.protocol.replace(/:$/, ''), origin: u.origin, host: u.host, hostname: u.hostname,
        port: u.port || null, path: u.pathname, query, fragment: u.hash.replace(/^#/, '') || null,
        username: u.username || null, password: u.password || null,
      };
    }
    case 'build_url': {
      const hostname = reqStr(args, 'hostname', '"example.com"');
      const protocol = (typeof args.protocol === 'string' ? args.protocol : 'https').replace(/:$/, '');
      let s = `${protocol}://${hostname}`;
      if (typeof args.port === 'number') s += `:${args.port}`;
      let path = typeof args.path === 'string' ? args.path : '/';
      if (!path.startsWith('/')) path = '/' + path;
      s += path;
      if (args.query && typeof args.query === 'object') {
        const p = new URLSearchParams();
        for (const [k, v] of Object.entries(args.query as Record<string, unknown>)) {
          if (Array.isArray(v)) v.forEach((x) => p.append(k, String(x)));
          else p.append(k, String(v));
        }
        const qs = p.toString(); if (qs) s += '?' + qs;
      }
      if (typeof args.hash === 'string' && args.hash) s += '#' + args.hash.replace(/^#/, '');
      return { url: s };
    }
    case 'parse_query': {
      const q = reqStr(args, 'query', '"a=1&b=2"').replace(/^\?/, '');
      const params = new URLSearchParams(q);
      const out: Record<string, string | string[]> = {};
      for (const [k, v] of params) out[k] = k in out ? ([] as string[]).concat(out[k] as any, v) : v;
      return { input: q, params: out };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function reqStr(args: Record<string, unknown>, key: string, ex: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${ex}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
