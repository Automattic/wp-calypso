/** @format */

/**
 * Internal dependencies
 */
import getSiteChecklistIsLoading from 'state/selectors/get-site-checklist-is-loading';

describe( 'getSiteChecklistIsLoading()', () => {
	test( 'should return `false` by default', () => {
		const isLoading = getSiteChecklistIsLoading( {}, 1234567 );
		expect( isLoading ).toEqual( false );
	} );

	test( 'should return isLoading value', () => {
		const state = {
			checklist: {
				1234567: {
					isLoading: true,
				},
			},
		};
		const isLoading = getSiteChecklistIsLoading( state, 1234567 );
		expect( isLoading ).toEqual( true );
	} );
} );
