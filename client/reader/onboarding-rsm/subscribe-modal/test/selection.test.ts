import { nextSelectedSite } from '../selection';
import type { CardData } from '../use-subscribe-recommendations';

const card = ( feed_ID: number ): CardData => ( {
	feed_ID,
	site_ID: 0,
	site_URL: `https://example-${ feed_ID }.test`,
	site_name: `Example ${ feed_ID }`,
} );

describe( 'nextSelectedSite', () => {
	it( 'returns undefined when there are no recommendations and no current selection', () => {
		expect( nextSelectedSite( null, [] ) ).toBeUndefined();
	} );

	it( 'clears the selection when recommendations becomes empty', () => {
		expect( nextSelectedSite( card( 1 ), [] ) ).toBeNull();
	} );

	it( 'auto-selects the first recommendation when nothing is selected', () => {
		const list = [ card( 1 ), card( 2 ) ];
		expect( nextSelectedSite( null, list ) ).toBe( list[ 0 ] );
	} );

	it( 'returns undefined when the current selection is still present', () => {
		const list = [ card( 1 ), card( 2 ) ];
		expect( nextSelectedSite( list[ 0 ], list ) ).toBeUndefined();
	} );

	it( 'returns undefined when the current selection is still present at a non-first index', () => {
		const list = [ card( 1 ), card( 2 ), card( 3 ) ];
		expect( nextSelectedSite( list[ 2 ], list ) ).toBeUndefined();
	} );

	it( 'repoints to the first recommendation when the current selection has been pruned', () => {
		// Simulates the prune-after-already-followed case: a card that was
		// previously selected is removed from `recommendations`, so the
		// effect should repoint to the new first card rather than leave the
		// preview column showing a stream for a site that's no longer listed.
		const stale = card( 99 );
		const list = [ card( 1 ), card( 2 ) ];
		expect( nextSelectedSite( stale, list ) ).toBe( list[ 0 ] );
	} );

	it( 'matches the current selection by feed_ID, not object identity', () => {
		// `combinedRecommendations` re-spreads its source rows into new
		// objects on every recompute, so a still-present card will arrive
		// with a fresh reference. The helper must compare by `feed_ID`.
		const sameFeedFreshRef: CardData = {
			feed_ID: 1,
			site_ID: 0,
			site_URL: 'https://example-1.test',
			site_name: 'Example 1',
		};
		const list = [ card( 1 ), card( 2 ) ];
		expect( nextSelectedSite( sameFeedFreshRef, list ) ).toBeUndefined();
	} );
} );
