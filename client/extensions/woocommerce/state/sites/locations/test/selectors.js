/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	areLocationsLoaded,
	areLocationsLoading,
	getContinents,
	getCountries,
	getCountryName,
	getStates,
	hasStates,
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

const locations = [
	{
		code: 'NA',
		name: 'North America',
		countries: [
			{
				code: 'US',
				name: 'United States',
				states: [
					{
						code: 'UT',
						name: 'Utah',
					},
					{
						code: 'AL',
						name: 'Alabama',
					},
					{
						code: 'CA',
						name: 'California',
					},
				],
			},
			{
				code: 'CA',
				name: 'Canada',
				states: [
					{
						code: 'BC',
						name: 'British Columbia',
					},
					{
						code: 'ON',
						name: 'Ontario',
					},
				],
			},
		],
	},
	{
		code: 'AF',
		name: 'Africa',
		countries: [
			{
				code: 'SA',
				name: 'South Africa',
				states: [],
			},
			{
				code: 'EG',
				name: 'Egypt',
				states: [],
			},
		],
	},
];

const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					locations,
				},
			},
		},
	},
	ui: {
		selectedSiteId: 123,
	},
};

const loadingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					locations: LOADING,
				},
			},
		},
	},
	ui: {
		selectedSiteId: 123,
	},
};

const emptyState = {
	extensions: {
		woocommerce: {},
	},
	ui: {
		selectedSiteId: 123,
	},
};

describe( 'selectors', () => {
	describe( '#areLocationsLoaded', () => {
		it( 'should return false when woocommerce state is not available.', () => {
			expect( areLocationsLoaded( emptyState, 123 ) ).to.be.false;
		} );

		it( 'should return true when locations are loaded.', () => {
			expect( areLocationsLoaded( loadedState, 123 ) ).to.be.true;
		} );

		it( 'should return false when locations are currently being fetched.', () => {
			expect( areLocationsLoaded( loadingState, 123 ) ).to.be.false;
		} );

		it( 'should return false when locations are loaded only for a different site.', () => {
			expect( areLocationsLoaded( loadedState, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areLocationsLoaded( loadedState ) ).to.be.true;
		} );
	} );

	describe( '#areLocationsLoading', () => {
		it( 'should return false when woocommerce state is not available.', () => {
			expect( areLocationsLoading( emptyState, 123 ) ).to.be.false;
		} );

		it( 'should return false when locations are loaded.', () => {
			expect( areLocationsLoading( loadedState, 123 ) ).to.be.false;
		} );

		it( 'should return true when locations are currently being fetched.', () => {
			expect( areLocationsLoading( loadingState, 123 ) ).to.be.true;
		} );

		it( 'should return false when locations are loaded only for a different site.', () => {
			expect( areLocationsLoading( loadingState, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areLocationsLoading( loadingState ) ).to.be.true;
		} );
	} );

	describe( '#getContinents', () => {
		it( 'should return an empty list if the locations are not loaded', () => {
			expect( getContinents( emptyState ) ).to.deep.equal( [] );
		} );

		it( 'should return an empty list if the locations are being loaded', () => {
			expect( getContinents( loadingState ) ).to.deep.equal( [] );
		} );

		it( 'should return the continents, sorted by name', () => {
			expect( getContinents( loadedState ) ).to.deep.equal( [
				{ code: 'AF', name: 'Africa' },
				{ code: 'NA', name: 'North America' },
			] );
		} );
	} );

	describe( '#getCountries', () => {
		it( 'should return an empty list if the locations are not loaded', () => {
			expect( getCountries( emptyState, 'NA' ) ).to.deep.equal( [] );
		} );

		it( 'should return an empty list if the locations are being loaded', () => {
			expect( getCountries( loadingState, 'NA' ) ).to.deep.equal( [] );
		} );

		it( 'should return an empty list if the continent does not exist', () => {
			expect( getCountries( loadedState, 'XX' ) ).to.deep.equal( [] );
		} );

		it( 'should return the countries from a continent, sorted by name', () => {
			expect( getCountries( loadedState, 'NA' ) ).to.deep.equal( [
				{ code: 'CA', name: 'Canada' },
				{ code: 'US', name: 'United States' },
			] );
		} );
	} );

	describe( '#getCountryName', () => {
		it( 'should fallback to the country code if the locations are not loaded', () => {
			expect( getCountryName( emptyState, 'US' ) ).to.equal( 'US' );
		} );

		it( 'should fallback to the country code if the country does not exist', () => {
			expect( getCountryName( loadedState, 'XX' ) ).to.equal( 'XX' );
		} );

		it( 'should return the country name', () => {
			expect( getCountryName( loadedState, 'US' ) ).to.equal( 'United States' );
		} );
	} );

	describe( '#getStates', () => {
		it( 'should return an empty list if the locations are not loaded', () => {
			expect( getStates( emptyState, 'US' ) ).to.deep.equal( [] );
		} );

		it( 'should return an empty list if the locations are being loaded', () => {
			expect( getStates( loadingState, 'US' ) ).to.deep.equal( [] );
		} );

		it( 'should return an empty list if the country does not exist', () => {
			expect( getStates( loadedState, 'XX' ) ).to.deep.equal( [] );
		} );

		it( 'should return an empty list if the country does not have states', () => {
			expect( getStates( loadedState, 'SA' ) ).to.deep.equal( [] );
		} );

		it( 'should return the states from a country, sorted by name', () => {
			expect( getStates( loadedState, 'US' ) ).to.deep.equal( [
				{ code: 'AL', name: 'Alabama' },
				{ code: 'CA', name: 'California' },
				{ code: 'UT', name: 'Utah' },
			] );
		} );
	} );

	describe( '#hasStates', () => {
		it( 'should return false if the locations are not loaded', () => {
			expect( hasStates( emptyState, 'US' ) ).to.be.false;
		} );

		it( 'should return false if the locations are being loaded', () => {
			expect( hasStates( loadingState, 'US' ) ).to.be.false;
		} );

		it( 'should return false if the country does not exist', () => {
			expect( hasStates( loadedState, 'XX' ) ).to.be.false;
		} );

		it( 'should return false if the country does not have states', () => {
			expect( hasStates( loadedState, 'SA' ) ).to.be.false;
		} );

		it( 'should return true if the country has states', () => {
			expect( hasStates( loadedState, 'US' ) ).to.be.true;
		} );
	} );
} );
