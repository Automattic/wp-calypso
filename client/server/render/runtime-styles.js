// CSS-module class names in `@wordpress/style-runtime` styles: a 16-character hex hash, prefixed
// with `_` when it starts with a digit, then `__` and the local name.
const HASHED_CLASS = /\.(_?[0-9a-f]{16}__[\w-]+)/g;

const classesByHash = new Map();

/**
 * Returns the `@wordpress/style-runtime` styles that the given server-rendered markup uses.
 *
 * Components using that runtime register their CSS when their module loads and only inject it
 * into a browser document, so server-rendered markup would otherwise arrive unstyled. A style
 * counts as used when any of its hashed class names appears in the markup; the client skips
 * hashes that are already in the document head.
 * @param {string} markup - Server-rendered markup
 * @param {Map<string, string>} [styles] - Registered styles, keyed by hash
 * @returns {Array<[string, string]>} Used styles as [hash, css] pairs
 */
export function getUsedRuntimeStyles( markup, styles = globalThis.__wpStyleRuntime?.styles ) {
	if ( ! markup || ! styles ) {
		return [];
	}

	return [ ...styles ].filter( ( [ hash, css ] ) => {
		if ( ! classesByHash.has( hash ) ) {
			classesByHash.set( hash, [
				...new Set( [ ...css.matchAll( HASHED_CLASS ) ].map( ( match ) => match[ 1 ] ) ),
			] );
		}
		return classesByHash.get( hash ).some( ( className ) => markup.includes( className ) );
	} );
}
