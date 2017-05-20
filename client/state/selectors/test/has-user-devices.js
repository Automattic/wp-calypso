/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { hasUserDevices } from '../';

describe( '#hasUserDevices()', () => {
	it( 'should return false if there are no devices for the curren user', () => {
		const result = hasUserDevices( { userDevices: { items: {} } } );
		expect( result ).to.be.false;
	} );

	it( 'should return true if there are devices for the curren user', () => {
		const result = hasUserDevices( { userDevices: { items: {
			1: { device_id: 1, device_name: 'Mobile Phone' },
			2: { device_id: 2, device_name: 'Tablet' }
		} } } );
		expect( result ).to.be.true;
	} );
} );
