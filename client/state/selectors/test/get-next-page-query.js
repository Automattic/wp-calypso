/**
 * Internal dependencies
 */
import getNextPageQuery from 'state/selectors/get-next-page-query';
import MediaQueryManager from 'lib/query-manager/media';

describe( 'getNextPageQuery', () => {
	const siteId = 23465832;

	const query = {
		number: 55,
	};
	const queryManager = new MediaQueryManager( [], { query } );

	it( 'should return the default query when no query manager exists', () => {
		const state = {
			media: {
				fetching: {},
			},
		};

		expect( getNextPageQuery( state, siteId ) ).toEqual( { number: 20 } );
	} );

	// null represents when there is no next page
	it.each( [ Symbol( 'next page handle' ), null ] )(
		'should return the existing query with the next page handle',
		( nextPageHandle ) => {
			const state = {
				media: {
					queries: {
						[ siteId ]: queryManager,
					},
					fetching: {
						[ siteId ]: {
							nextPageHandle,
							query: {
								number: 55,
							},
						},
					},
				},
			};

			expect( getNextPageQuery( state, siteId ) ).toEqual( {
				...query,
				page_handle: nextPageHandle,
			} );
		}
	);
} );
