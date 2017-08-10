/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getPaymentMethodDetails from '../index';

describe( 'getPaymentMethodDetails', () => {
	it( 'returns an empty object when no mapping is found', () => {
		const methodType = getPaymentMethodDetails( 'foobarbangbuzz' );
		expect( methodType ).to.eql( {} );
	} );
	it( 'returns object containing info from detailsMap', () => {
		const methodType = getPaymentMethodDetails( 'bacs' );
		expect( methodType ).to.eql( {
			methodType: 'offline',
		} );
	} );
} );
