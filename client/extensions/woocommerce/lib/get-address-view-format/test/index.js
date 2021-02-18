/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getAddressViewFormat from '../index';

describe( 'getAddressViewFormat', () => {
	test( 'returns a "skeleton" object if no address is supplied', () => {
		expect( getAddressViewFormat( {} ) ).to.eql( {
			street: '',
			street2: '',
			city: '',
			state: '',
			country: '',
			postcode: '',
		} );
	} );

	test( 'returns correctly formatted address', () => {
		const ApiAddress = {
			address_1: '1 Main St',
			address_2: '',
			city: 'Somerville',
			state: 'MA',
			country: 'US',
			postcode: '02111',
		};

		expect( getAddressViewFormat( ApiAddress ) ).to.eql( {
			street: '1 Main St',
			street2: '',
			city: 'Somerville',
			state: 'MA',
			country: 'US',
			postcode: '02111',
		} );
	} );
} );
