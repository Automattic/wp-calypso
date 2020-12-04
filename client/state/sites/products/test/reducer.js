/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { products } from '../reducer';
import {
	SITE_PRODUCTS_FETCH,
	SITE_PRODUCTS_FETCH_COMPLETED,
	SITE_PRODUCTS_FETCH_FAILED,
	SITE_PRODUCTS_REMOVE,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	describe( '#products()', () => {
		test( 'should return an empty state when original state is undefined and action is empty', () => {
			const state = products( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should return an empty state when original state and action are empty', () => {
			const original = Object.freeze( {} );
			const state = products( original, {} );

			expect( state ).to.eql( original );
		} );

		test( 'should return an empty state when original state is undefined and action is unknown', () => {
			const state = products( undefined, {
				type: 'SAY_HELLO',
				siteId: 11111111,
			} );

			expect( state ).to.eql( {} );
		} );

		test( 'should return the original state when action is unknown', () => {
			const original = Object.freeze( {
				11111111: {
					data: {},
					error: null,
					hasLoadedFromServer: true,
					isRequesting: false,
				},
			} );
			const state = products( original, {
				type: 'MAKE_COFFEE',
				siteId: 11111111,
			} );

			expect( state ).to.eql( original );
		} );

		test( 'should return the initial state with requesting enabled when fetching is triggered', () => {
			const state = products( undefined, {
				type: SITE_PRODUCTS_FETCH,
				siteId: 11111111,
			} );

			expect( state ).to.eql( {
				11111111: {
					data: null,
					error: null,
					hasLoadedFromServer: false,
					isRequesting: true,
				},
			} );
		} );

		test( 'should return the original state with an error and requesting disabled when fetching failed', () => {
			const original = Object.freeze( {
				11111111: {
					data: {},
					error: null,
					hasLoadedFromServer: true,
					isRequesting: true,
				},
			} );
			const state = products( original, {
				type: SITE_PRODUCTS_FETCH_FAILED,
				siteId: 11111111,
				error: 'Unable to fetch site products',
			} );

			expect( state ).to.eql( {
				11111111: {
					data: {},
					error: 'Unable to fetch site products',
					hasLoadedFromServer: true,
					isRequesting: false,
				},
			} );
		} );

		test( 'should return a list of products with loaded from server enabled and requesting disabled when fetching completed', () => {
			const state = products( undefined, {
				type: SITE_PRODUCTS_FETCH_COMPLETED,
				siteId: 11111111,
				products: {},
			} );

			expect( state ).to.eql( {
				11111111: {
					data: {},
					error: null,
					hasLoadedFromServer: true,
					isRequesting: false,
				},
			} );
		} );

		test( 'should accumulate products for different sites', () => {
			const original = Object.freeze( {
				11111111: {
					data: {},
					error: null,
					hasLoadedFromServer: true,
					isRequesting: false,
				},
			} );
			const state = products( original, {
				type: SITE_PRODUCTS_FETCH,
				siteId: 55555555,
			} );

			expect( state ).to.eql( {
				11111111: {
					data: {},
					error: null,
					hasLoadedFromServer: true,
					isRequesting: false,
				},
				55555555: {
					data: null,
					error: null,
					hasLoadedFromServer: false,
					isRequesting: true,
				},
			} );
		} );

		test( 'should override previous products of the same site', () => {
			const original = Object.freeze( {
				11111111: {
					data: null,
					error: 'Unable to fetch site products',
					hasLoadedFromServer: false,
					isRequesting: false,
				},
			} );
			const state = products( original, {
				type: SITE_PRODUCTS_FETCH,
				siteId: 11111111,
			} );

			expect( state ).to.eql( {
				11111111: {
					data: null,
					error: null,
					hasLoadedFromServer: false,
					isRequesting: true,
				},
			} );
		} );

		test( 'should return an empty state when original state is undefined and removal is triggered', () => {
			const state = products( undefined, {
				type: SITE_PRODUCTS_REMOVE,
				siteId: 11111111,
			} );

			expect( state ).to.eql( {} );
		} );

		test( 'should return the original state when removal is triggered for an unknown site', () => {
			const original = Object.freeze( {
				11111111: {
					data: null,
					error: 'Unable to fetch site products',
					hasLoadedFromServer: false,
					isRequesting: false,
				},
			} );
			const state = products( original, {
				type: SITE_PRODUCTS_REMOVE,
				siteId: 22222222,
			} );

			expect( state ).to.eql( original );
		} );

		test( 'should remove products for a given site when removal is triggered', () => {
			const original = Object.freeze( {
				11111111: {
					data: null,
					error: 'Unable to fetch site products',
					hasLoadedFromServer: false,
					isRequesting: false,
				},
				22222222: {
					data: {},
					error: null,
					hasLoadedFromServer: true,
					isRequesting: false,
				},
			} );
			const state = products( original, {
				type: SITE_PRODUCTS_REMOVE,
				siteId: 11111111,
			} );

			expect( state ).to.eql( {
				22222222: {
					data: {},
					error: null,
					hasLoadedFromServer: true,
					isRequesting: false,
				},
			} );
		} );
	} );
} );
