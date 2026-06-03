import { select, dispatch, subscribe } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';

/**
 * Fixes the Query Loop block placeholder on WordPress.com so the "Choose"
 * button (which opens the pattern picker) is shown alongside "Start blank".
 *
 * Root cause: On WordPress.com, block patterns are loaded from the REST API
 * without the `blockTypes` field populated. The Query Loop block's placeholder
 * only renders the "Choose" button when `useBlockPatternsByBlockTypes( ['core/query'] )`
 * returns at least one pattern — i.e., when at least one pattern carries
 * `blockTypes: ['core/query']`. Because the WordPress.com REST API omits that
 * field, no patterns satisfy the filter and the button is hidden.
 *
 * Fix: after patterns load from the `core` store, find any pattern whose
 * serialised block markup contains `<!-- wp:query` but that lacks
 * `'core/query'` in its `blockTypes` array, then inject copies of those
 * patterns — enriched with the correct `blockTypes` value — into the
 * `__experimentalBlockPatterns` block-editor setting. Because
 * `core/block-editor`'s `getAllPatterns` selector places
 * `__experimentalBlockPatterns` entries before REST-API entries and
 * deduplicates by name (keeping the first match), the enriched copies take
 * precedence and the Query Loop block can find them.
 *
 * This does not reproduce on self-hosted WordPress because Gutenberg registers
 * core Query patterns via PHP (`register_block_pattern`) with `blockTypes` set.
 *
 * @see EDI-562
 */
function fixQueryLoopPatternPlaceholder() {
	// Guard: the `core` store must expose `getBlockPatterns`.
	if ( typeof select( 'core' ).getBlockPatterns !== 'function' ) {
		return;
	}

	const unsubscribe = subscribe( () => {
		const patterns = select( 'core' ).getBlockPatterns();

		// Patterns are fetched asynchronously; wait until they arrive.
		if ( ! patterns || patterns.length === 0 ) {
			return;
		}

		// We only need to run this once.
		unsubscribe();

		// Patterns that contain a Query block but don't already declare
		// 'core/query' in their blockTypes.
		const queryPatterns = patterns.filter(
			( pattern ) =>
				pattern.content?.includes( '<!-- wp:query' ) &&
				! pattern.blockTypes?.includes( 'core/query' )
		);

		if ( queryPatterns.length === 0 ) {
			return;
		}

		const existingPatterns =
			select( 'core/block-editor' ).getSettings().__experimentalBlockPatterns ?? [];

		// Build enriched copies with 'core/query' appended to blockTypes.
		const enrichedPatterns = queryPatterns.map( ( pattern ) => ( {
			...pattern,
			blockTypes: [ ...( pattern.blockTypes ?? [] ), 'core/query' ],
		} ) );

		// Prepend the enriched patterns so that deduplication (by name) in
		// getAllPatterns() keeps these over the REST-API originals that lack blockTypes.
		dispatch( 'core/block-editor' ).updateSettings( {
			__experimentalBlockPatterns: [ ...enrichedPatterns, ...existingPatterns ],
		} );
	}, 'core' );
}

domReady( fixQueryLoopPatternPlaceholder );
