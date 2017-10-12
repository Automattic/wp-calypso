/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { isAccountRecoveryUserDataReady } from '../';

describe( 'isAccountRecoveryUserDataReady()', () => {
	test( 'should return true if user field is set', () => {
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					userData: {
						user: 'foouser',
					},
				},
			},
		} );

		expect( isAccountRecoveryUserDataReady( state ) ).toBe( true );
	} );

	test( 'should return true if firstname, lastname, and url is set.', () => {
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					userData: {
						firstname: 'Foo',
						lastname: 'Bar',
						url: 'example.com',
					},
				},
			},
		} );

		expect( isAccountRecoveryUserDataReady( state ) ).toBe( true );
	} );

	test( 'should return false if one of ( firstname, lastname, url ) is missing.', () => {
		const noFirstname = deepFreeze( {
			accountRecovery: {
				reset: {
					userData: {
						lastname: 'Bar',
						url: 'example.com',
					},
				},
			},
		} );

		expect( isAccountRecoveryUserDataReady( noFirstname ) ).toBe( false );

		const noLastname = deepFreeze( {
			accountRecovery: {
				reset: {
					userData: {
						firstname: 'Foo',
						url: 'example.com',
					},
				},
			},
		} );

		expect( isAccountRecoveryUserDataReady( noLastname ) ).toBe( false );

		const noUrl = deepFreeze( {
			accountRecovery: {
				reset: {
					userData: {
						firstname: 'Foo',
						lastname: 'Bar',
					},
				},
			},
		} );

		expect( isAccountRecoveryUserDataReady( noUrl ) ).toBe( false );
	} );

	test( 'should return false as default value', () => {
		expect( isAccountRecoveryUserDataReady( undefined ) ).toBe( false );
	} );
} );
