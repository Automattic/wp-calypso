/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getCountries from '../get-countries';
import { listTypes } from 'state/countries/constants';

const { SMS, DOMAIN, PAYMENT } = listTypes,
	state = {
		countries: {
			items: {
				[ DOMAIN ]: [
					{ code: 'US', name: 'United States' }
				],
				[ PAYMENT ]: [],
				[ SMS ]: []
			},
			isRequesting: {
				[ DOMAIN ]: false,
				[ PAYMENT ]: false,
				[ SMS ]: true
			}
		}
	};

describe( 'getCountries()', () => {
	it( 'should return empty array if data isn\'t ready', () => {
		const states = getCountries( state, PAYMENT );

		expect( states ).to.eql( [] );
	} );

	it( 'should return the countries for the list type', () => {
		const states = getCountries( state, DOMAIN );

		expect( states ).to.eql( [
			{ code: 'US', name: 'United States' }
		] );
	} );
} );
