/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingUserDevices } from '../';

describe( '#isRequestingUserDevices()', () => {
	it( 'should return true if devices are currently being requested for the current user', () => {
		const result = isRequestingUserDevices( { userDevices: { isRequesting: true } } );
		expect( result ).to.be.true;
	} );

	it( 'should return false if devices are currently not being requested for the current user', () => {
		const result = isRequestingUserDevices( { userDevices: { isRequesting: false } } );
		expect( result ).to.be.false;
	} );
} );
