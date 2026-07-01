# mcp-url

URL parsing & building MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1148+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `parse_url` | Parse a URL into its components (keyless, offline): protocol, host, hostname, port, path, query (as an object), fragment, origin, and any userinfo. |
| `build_url` | Build a URL string from components. Provide at least `hostname` (and optionally protocol, port, path, hash) plus a `query` object of key/value pairs. |
| `parse_query` | Parse a query string (with or without a leading "?") into an object; repeated keys become arrays. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "url": {
      "url": "https://gateway.pipeworx.io/url/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1148+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Url data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
