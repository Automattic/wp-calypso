/** @format */

/**
 * Internal dependencies
 */
import isSiteChecklistLoading from 'state/selectors/is-site-checklist-loading';

describe( 'isSiteChecklistLoading()', () => {
	test( 'should return `false` by default', () => {
		const isLoading = isSiteChecklistLoading( {}, 1234567 );
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
		const isLoading = isSiteChecklistLoading( state, 1234567 );
		expect( isLoading ).toEqual( true );
	} );
} );
