/**
 * Shares a single Smooch instance across bundles.
 *
 * Smooch expects to be the only copy on the page — it owns a global callback and a fixed
 * iframe id. So when Help Center and Agents Manager load as separate bundles together
 * (e.g. the Site Editor), two copies collide and throw "Cannot read properties of
 * undefined (reading 'contentWindow')".
 *
 * This is aliased as `smooch` in both apps' webpack configs. The first bundle to import
 * it loads the real library and caches it on `window`; later bundles reuse that same
 * instance instead of loading their own. Consumers keep using `import Smooch from 'smooch'`.
 */

// TODO: Remove this shim and the `smooch$` webpack aliases once Agents Manager takes over
// the Help Center — they'll no longer load together, so only one Smooch copy will exist.
const SHARED_KEY = '__sharedSmoochInstance__';

let instance;
if ( typeof window !== 'undefined' && window[ SHARED_KEY ] ) {
	instance = window[ SHARED_KEY ];
} else {
	// Full path bypasses the `smooch$` alias to load the real library. Only runs when no
	// shared instance exists yet, so a second bundle never loads its own copy. smooch is a
	// dependency of the app bundles that use this shim (help-center, agents-manager).
	// eslint-disable-next-line import/no-extraneous-dependencies
	const real = require( 'smooch/lib/index.js' );
	instance = real && real.default ? real.default : real;
	if ( typeof window !== 'undefined' ) {
		window[ SHARED_KEY ] = instance;
	}
}

Object.defineProperty( exports, '__esModule', { value: true } );
exports.default = instance;
