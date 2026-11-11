// react-markdown is ESM-only, so Jest tests render its source text instead.
const Markdown = ( { children } ) => children ?? null;

module.exports = {
	__esModule: true,
	default: Markdown,
	MarkdownAsync: Markdown,
	MarkdownHooks: Markdown,
	defaultUrlTransform: ( value ) => value,
};
