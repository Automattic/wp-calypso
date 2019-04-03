/** @format */

/**
 * Internal dependencies
 */
import getSiteChecklistIsLoading from 'state/selectors/get-site-checklist-is-loading';

describe( 'getSiteChecklistIsLoading()', () => {
	test( 'should return `false` by default', () => {
		const isLoading = getSiteChecklistIsLoading( {} );
		expect( isLoading ).toEqual( false );
	} );

	test( 'should return isLoading value', () => {
		const state = {
			checklist: {
				isLoading: true,
			},
		};
		const isLoading = getSiteChecklistIsLoading( state );
		expect( isLoading ).toEqual( true );
	} );
} );
