/**
 * Internal dependencies
 */
import userHasAnyAtomicSites from 'calypso/state/selectors/user-has-any-atomic-sites';

describe( 'userHasAnyAtomicSites()', () => {
	test( 'should return false if no sites in state', () => {
		const state = {
			sites: {
				items: {},
			},
		};

		expect( userHasAnyAtomicSites( state ) ).toBe( false );
	} );

	test( 'should return false if no sites are Atomic', () => {
		const state = {
			sites: {
				items: {
					2916288: {
						ID: 2916288,
						name: 'WordPress.com Example Blog',
						options: {
							is_automated_transfer: false,
						},
					},
					1234567: {
						ID: 1234567,
						name: 'WordPress.com Example Blog',
						options: {
							is_automated_transfer: false,
						},
					},
				},
			},
		};

		expect( userHasAnyAtomicSites( state ) ).toBe( false );
	} );

	test( 'should return true if at least one site is Atomic', () => {
		const state = {
			sites: {
				items: {
					2916288: {
						ID: 2916288,
						name: 'WordPress.com Example Blog',
						options: {
							is_automated_transfer: true,
						},
					},
					1234567: {
						ID: 1234567,
						name: 'WordPress.com Example Blog',
						options: {
							is_automated_transfer: false,
						},
					},
				},
			},
		};

		expect( userHasAnyAtomicSites( state ) ).toBe( true );
	} );
} );
