/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getCountries,
	isFetching
} from '../selectors';
import { SMS, DOMAIN, PAYMENT } from '../constants';

describe( 'selectors', () => {
	const state = {
		countries: {
			items: {
				[ DOMAIN ]: [
					{ code: 'US', name: 'United States' }
				],
				[ PAYMENT ]: [],
				[ SMS ]: []
			},
			isFetching: {
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

	describe( 'isFetching()', () => {
		it( 'should return false if the country there is no active request', () => {
			const isRequesting = isFetching( state, DOMAIN );

			expect( isRequesting ).to.eql( false );
		} );

		it( 'should return true if a request is in progress', () => {
			const isRequesting = isFetching( state, SMS );

			expect( isRequesting ).to.eql( true );
		} );
	} );
} );
