/**
 * Internal dependencies
 */
import getDismissedSites from 'state/selectors/get-dismissed-sites';

describe( 'getDismissedSites()', () => {
	test( 'should return an array of dismissed site IDs', () => {
		const state = {
			reader: {
				siteDismissals: {
					items: {
						123: true,
						124: false,
						125: true,
					},
				},
			},
		};
		expect( getDismissedSites( state ) ).toEqual( [ 123, 125 ] );
	} );
} );
