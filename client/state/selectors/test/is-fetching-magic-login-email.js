/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isFetchingMagicLoginEmail } from '../';

describe( 'isFetchingMagicLoginEmail()', () => {
	it( 'should return false if there is no fetching information yet', () => {
		const isFetching = isFetchingMagicLoginEmail( undefined );
		expect( isFetching ).to.be.false;
	} );

	it( 'should return true if client is requesting an email', () => {
		const isFetching = isFetchingMagicLoginEmail( {
			login: {
				magicLogin: {
					isFetchingEmail: true,
				},
			},
		} );
		expect( isFetching ).to.be.true;
	} );

	it( 'should return false when finished requesting an email', () => {
		const isFetching = isFetchingMagicLoginEmail( {
			login: {
				magicLogin: {
					isFetchingEmail: false,
				},
			},
		} );
		expect( isFetching ).to.be.false;
	} );
} );
