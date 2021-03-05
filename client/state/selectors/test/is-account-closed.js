/**
 * Internal dependencies
 */
import isAccountClosed from 'calypso/state/selectors/is-account-closed';

describe( 'isAccountClosed()', () => {
	test( 'should return false if state is empty', () => {
		const state = {};

		expect( isAccountClosed( state ) ).toBe( false );
	} );

	test( 'should return false if account is open', () => {
		const state = {
			account: {
				isClosed: false,
			},
		};

		expect( isAccountClosed( state ) ).toBe( false );
	} );

	test( 'should return true if account is closed', () => {
		const state = {
			account: {
				isClosed: true,
			},
		};

		expect( isAccountClosed( state ) ).toBe( true );
	} );
} );
