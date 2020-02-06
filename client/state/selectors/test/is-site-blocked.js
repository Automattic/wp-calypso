/**
 * Internal dependencies
 */
import isSiteBlocked from 'state/reader/site-blocks/selectors/is-site-blocked';

describe( 'isSiteBlocked()', () => {
	test( 'should return true if the specified site is blocked', () => {
		const state = {
			reader: {
				siteBlocks: {
					items: {
						123: true,
						124: false,
					},
				},
			},
		};
		expect( isSiteBlocked( state, 123 ) ).toBe( true );
		expect( isSiteBlocked( state, 124 ) ).toBe( false );
		expect( isSiteBlocked( state, 125 ) ).toBe( false );
	} );
} );
