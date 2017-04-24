/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { isAccountRecoveryUserDataReady } from '../';

describe( 'isAccountRecoveryUserDataReady()', () => {
	it( 'should return true if user field is set', () => {
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					userData: {
						user: 'foouser',
					},
				},
			},
		} );

		assert.isTrue( isAccountRecoveryUserDataReady( state ) );
	} );

	it( 'should return true if firstname, lastname, and url is set.', () => {
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

		assert.isTrue( isAccountRecoveryUserDataReady( state ) );
	} );

	it( 'should return false if one of ( firstname, lastname, url ) is missing.', () => {
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

		assert.isFalse( isAccountRecoveryUserDataReady( noFirstname ) );

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

		assert.isFalse( isAccountRecoveryUserDataReady( noLastname ) );

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

		assert.isFalse( isAccountRecoveryUserDataReady( noUrl ) );
	} );

	it( 'should return false as default value', () => {
		assert.isFalse( isAccountRecoveryUserDataReady( undefined ) );
	} );
} );
