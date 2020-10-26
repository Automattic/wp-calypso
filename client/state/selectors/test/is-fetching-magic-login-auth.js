/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isFetchingMagicLoginAuth from 'calypso/state/selectors/is-fetching-magic-login-auth';

describe( 'isFetchingMagicLoginAuth()', () => {
	test( 'should return false if there is no fetching information yet', () => {
		const isFetching = isFetchingMagicLoginAuth( undefined );
		expect( isFetching ).to.be.false;
	} );

	test( 'should return true if client is requesting auth', () => {
		const isFetching = isFetchingMagicLoginAuth( {
			login: {
				magicLogin: {
					isFetchingAuth: true,
				},
			},
		} );
		expect( isFetching ).to.be.true;
	} );

	test( 'should return false when finished requesting auth', () => {
		const isFetching = isFetchingMagicLoginAuth( {
			login: {
				magicLogin: {
					isFetchingAuth: false,
				},
			},
		} );
		expect( isFetching ).to.be.false;
	} );
} );
