/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import isFetchingNextPage from 'calypso/state/selectors/is-fetching-next-page';

describe( 'isFetchingNextPage()', () => {
	const state = {
		media: {
			fetching: {
				2916284: {
					nextPage: true,
				},
			},
		},
	};

	test( 'should return false if not fetching next media page', () => {
		const isFetching = isFetchingNextPage( state, 2916285 );

		expect( isFetching ).toBe( false );
	} );

	test( 'should return true if fetching next media page', () => {
		const isFetching = isFetchingNextPage( state, 2916284 );

		expect( isFetching ).toBe( true );
	} );
} );
