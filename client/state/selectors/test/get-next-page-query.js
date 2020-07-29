/**
 * Internal dependencies
 */
import getNextPageQuery from 'state/selectors/get-next-page-query';

describe( 'getNextPageQuery', () => {
	const siteId = 23465832;

	const query = {
		number: 55,
	};

	it( `should return the default query when there's no active query`, () => {
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
