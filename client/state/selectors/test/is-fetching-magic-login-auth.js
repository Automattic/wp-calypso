/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isFetchingMagicLoginAuth } from '../';

describe( 'isFetchingMagicLoginAuth()', () => {
	it( 'should return false if there is no fetching information yet', () => {
		const isFetching = isFetchingMagicLoginAuth( undefined );
		expect( isFetching ).to.be.false;
	} );

	it( 'should return true if client is requesting auth', () => {
		const isFetching = isFetchingMagicLoginAuth( {
			login: {
				magicLogin: {
					isFetchingAuth: true,
				},
			},
		} );
		expect( isFetching ).to.be.true;
	} );

	it( 'should return false when finished requesting auth', () => {
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
