/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingGeo, getGeo, getGeoCountry, getGeoCountryShort } from '../selectors';

describe( 'selectors', () => {
	describe( 'isRequestingGeo()', () => {
		test( 'should return requesting state', () => {
			const isRequesting = isRequestingGeo( {
				geo: {
					requesting: true,
				},
			} );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( 'getGeo()', () => {
		test( 'should return geo data state', () => {
			const geo = getGeo( {
				geo: {
					geo: {
						latitude: '39.36006',
						longitude: '-84.30994',
						country_short: 'US',
						country_long: 'United States',
						region: 'Ohio',
						city: 'Mason',
					},
				},
			} );

			expect( geo ).to.eql( {
				latitude: '39.36006',
				longitude: '-84.30994',
				country_short: 'US',
				country_long: 'United States',
				region: 'Ohio',
				city: 'Mason',
			} );
		} );
	} );

	describe( 'getGeoCountry()', () => {
		test( 'should return null if no geo data state', () => {
			const country = getGeoCountry( {
				geo: {
					geo: null,
				},
			} );

			expect( country ).to.be.null;
		} );

		test( 'should return full country name of geo data state', () => {
			const country = getGeoCountry( {
				geo: {
					geo: {
						latitude: '39.36006',
						longitude: '-84.30994',
						country_short: 'US',
						country_long: 'United States',
						region: 'Ohio',
						city: 'Mason',
					},
				},
			} );

			expect( country ).to.equal( 'United States' );
		} );
	} );

	describe( 'getGeoCountryShort()', () => {
		test( 'should return null if no geo data state', () => {
			const country = getGeoCountryShort( {
				geo: {
					geo: null,
				},
			} );

			expect( country ).to.be.null;
		} );

		test( 'should return abbreviated country name of geo data state', () => {
			const country = getGeoCountryShort( {
				geo: {
					geo: {
						latitude: '39.36006',
						longitude: '-84.30994',
						country_short: 'US',
						country_long: 'United States',
						region: 'Ohio',
						city: 'Mason',
					},
				},
			} );

			expect( country ).to.equal( 'US' );
		} );
	} );
} );
