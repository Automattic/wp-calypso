import Lru from 'lru';

// CSS-module class names in `@wordpress/style-runtime` styles: a 16-character hex hash, prefixed
// with `_` when it starts with a digit, then `__` and the local name.
const HASHED_CLASS = /(?<![\w-])_?[0-9a-f]{16}__[\w-]+/g;

const usedStylesCache = new Lru( { max: 3000, maxAge: 3600000 } );
let classIndex = null;

/**
 * Maps each hashed class name to the registered styles that mention it. Rebuilt when more
 * modules register styles.
 * @param {Map<string, string>} styles - Registered styles, keyed by hash
 * @returns {Map<string, string[]>} Style hashes keyed by class name
 */
function getClassIndex( styles ) {
	if ( classIndex?.styles !== styles || classIndex.size !== styles.size ) {
		const hashesByClass = new Map();
		for ( const [ hash, css ] of styles ) {
			for ( const [ className ] of css.matchAll( HASHED_CLASS ) ) {
				const hashes = hashesByClass.get( className ) ?? [];
				if ( ! hashes.includes( hash ) ) {
					hashesByClass.set( className, [ ...hashes, hash ] );
				}
			}
		}
		classIndex = { styles, size: styles.size, hashesByClass };
	}
	return classIndex.hashesByClass;
}

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

	const hashesByClass = getClassIndex( styles );
	const used = new Set();
	for ( const [ className ] of markup.matchAll( HASHED_CLASS ) ) {
		for ( const hash of hashesByClass.get( className ) ?? [] ) {
			used.add( hash );
		}
	}
	return [ ...styles ].filter( ( [ hash ] ) => used.has( hash ) );
}

/**
 * Like `getUsedRuntimeStyles`, but scans the markup only the first time it sees `key`.
 * @param {string} key - Identifies markup that renders the same every time
 * @param {() => string | undefined} getMarkup - Returns the markup, or nothing when rendering
 * failed; not called on a cache hit
 * @returns {Array<[string, string]>} Used styles as [hash, css] pairs
 */
export function getCachedRuntimeStyles( key, getMarkup ) {
	let used = usedStylesCache.get( key );
	if ( ! used ) {
		const markup = getMarkup();
		used = getUsedRuntimeStyles( markup );
		// A failed render returns no markup; try again next time rather than cache that.
		if ( typeof markup === 'string' ) {
			usedStylesCache.set( key, used );
		}
	}
	return used;
}
