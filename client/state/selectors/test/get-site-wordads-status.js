import getSiteWordadsStatus from 'calypso/state/selectors/get-site-wordads-status';

const siteId = '123001';

describe( 'selectors', () => {
	describe( '#getSiteWordadsStatus()', () => {
		test( 'should return current status for a site if status exists', () => {
			const state = {
				wordads: {
					status: {
						123001: {
							status: 'ineligible',
						},
					},
				},
			};

			const status = getSiteWordadsStatus( state, siteId );
			expect( status ).toEqual( 'ineligible' );
		} );

		test( 'should return null when wordads status does not exist for site', () => {
			const state = {
				wordads: {},
			};

			const status = getSiteWordadsStatus( state, siteId );
			expect( status ).toEqual( null );
		} );
	} );
} );
