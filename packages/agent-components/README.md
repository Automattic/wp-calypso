# Agent components

Portable action surfaces shared by Agents Manager and the MCP App.

## Text content

`Text.content.text` and text resolved through `Text.content.path` support GitHub Flavored Markdown by default: emphasis, links, images, headings, lists, fenced code blocks, tables, task lists, strikethrough, and automatic links. Rendering uses `react-markdown` with `remark-gfm`, the same Markdown stack as Agenttic chat messages.

```json
{
	"id": "preview",
	"type": "Text",
	"variant": "body",
	"content": {
		"text": "**Preview**\n\n![Site preview](https://example.com/preview.png)\n\n[Open preview](https://example.com/)"
	}
}
```

Raw HTML is displayed as text. The Markdown renderer applies its default URL sanitization. Images scale to the available width; the embedding host's content security policy still determines which image sources can load. Button labels, field labels, and choice labels remain plain text.
