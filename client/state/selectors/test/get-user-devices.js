/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getUserDevices } from '../';

describe( '#getUserDevices()', () => {
	it( 'should return all available user devices', () => {
		const items = {
			1: { device_id: 1, device_name: 'Mobile Phone' },
			2: { device_id: 2, device_name: 'Tablet' }
		};
		const result = getUserDevices( { userDevices: { items } } );

		expect( result ).to.deep.equal( [
			{ device_id: 1, device_name: 'Mobile Phone' },
			{ device_id: 2, device_name: 'Tablet' }
		] );
	} );
} );
