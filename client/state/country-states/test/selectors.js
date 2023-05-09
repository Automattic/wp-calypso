import { getCountryStates, isCountryStatesFetching } from '../selectors';

describe( 'selectors', () => {
	const state = {
		countryStates: {
			items: {
				us: [ { code: 'ca', name: 'California' } ],
			},
			isFetching: {
				us: true,
				ca: false,
			},
		},
	};

	describe( 'getCountryStates()', () => {
		test( 'should return null if the country has no states', () => {
			const states = getCountryStates( state, 'de' );

			expect( states ).toBeNull();
		} );

		test( 'should return the states for the country', () => {
			const states = getCountryStates( state, 'us' );

			expect( states ).toEqual( [ { code: 'ca', name: 'California' } ] );
		} );
	} );

	describe( 'isCountryStatesFetching()', () => {
		test( 'should return false if the country has no states', () => {
			const isRequesting = isCountryStatesFetching( state, 'de' );

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return true if a request is in progress for the site', () => {
			const isRequesting = isCountryStatesFetching( state, 'us' );

			expect( isRequesting ).toBe( true );
		} );

		test( 'should return false if a request has completed for the site', () => {
			const isRequesting = isCountryStatesFetching( state, 'ca' );

			expect( isRequesting ).toBe( false );
		} );
	} );
} );
