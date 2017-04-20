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

	it( 'should return true if firstName, lastName, and url is set.', () => {
		const state = deepFreeze( {
			accountRecovery: {
				reset: {
					userData: {
						firstName: 'Foo',
						lastName: 'Bar',
						url: 'example.com',
					},
				},
			},
		} );

		assert.isTrue( isAccountRecoveryUserDataReady( state ) );
	} );

	it( 'should return false if one of ( firstName, lastName, url ) is missing.', () => {
		const noFirstName = deepFreeze( {
			accountRecovery: {
				reset: {
					userData: {
						lastName: 'Bar',
						url: 'example.com',
					},
				},
			},
		} );

		assert.isFalse( isAccountRecoveryUserDataReady( noFirstName ) );

		const noLastName = deepFreeze( {
			accountRecovery: {
				reset: {
					userData: {
						firstName: 'Foo',
						url: 'example.com',
					},
				},
			},
		} );

		assert.isFalse( isAccountRecoveryUserDataReady( noLastName ) );

		const noUrl = deepFreeze( {
			accountRecovery: {
				reset: {
					userData: {
						firstName: 'Foo',
						lastName: 'Bar',
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
