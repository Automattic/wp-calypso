/** @format */

jest.mock( 'lib/activePromotions/constants', () => ( {
	GROUP_WPCOM: 'GROUP_WPCOM',
	GROUP_JETPACK: 'GROUP_JETPACK',

	TERM_MONTHLY: 'TERM_MONTHLY',
	TERM_ANNUALLY: 'TERM_ANNUALLY',
	TERM_BIENNIALLY: 'TERM_BIENNIALLY',

	TYPE_FREE: 'TYPE_FREE',
	TYPE_PERSONAL: 'TYPE_PERSONAL',
	TYPE_PREMIUM: 'TYPE_PREMIUM',
	TYPE_BUSINESS: 'TYPE_BUSINESS',

	ACTIVE_PROMOTIONS_LIST: {
		jetpack_premium_monthly: {
			term: 'TERM_MONTHLY',
		},
		value_bundle: {
			term: 'TERM_ANNUALLY',
		},
		'personal-bundle-2y': {
			term: 'TERM_BIENNIALLY',
		},
	},
} ) );

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	getActivePromotions,
	isRequestingActivePromotions,
	getActivePromotion,
	getActivePromotionRawPrice,
	getACTIVE_PROMOTIONSlug,
} from '../selectors';
import { ACTIVE_PROMOTIONS, getStateInstance } from './fixture';

describe( 'selectors', () => {
	describe( '#getActivePromotions()', () => {
		test( 'should return WordPress ActivePromotions array', () => {
			const state = getStateInstance();
			const activePromotions = getActivePromotions( state );
			expect( activePromotions ).to.eql( ACTIVE_PROMOTIONS );
		} );
	} );

	describe( '#isRequestingActivePromotions()', () => {
		test( 'should return requesting state of ActivePromotions', () => {
			const state = getStateInstance();
			const isRequesting = isRequestingActivePromotions( state );
			expect( isRequesting ).to.eql( false );
		} );
	} );

	describe( '#getActivePromotion()', () => {
		test( 'should return a activePromotion when given a product id', () => {
			const state = getStateInstance();
			expect( getActivePromotion( state, 1003 ).product_id ).to.eql( 1003 );
			expect( getActivePromotion( state, 2002 ).product_id ).to.eql( 2002 );
		} );
		test( 'should return undefined when given an unknown product id', () => {
			const state = getStateInstance();
			expect( getActivePromotion( state, 44 ) ).to.eql( undefined );
		} );
	} );

	describe( '#getActivePromotionRawPrice()', () => {
		test( 'should return annual raw price', () => {
			const state = deepFreeze( {
				activePromotions: {
					items: [
						{
							product_id: 1003,
							product_slug: 'value_bundle',
							raw_price: 99,
						},
					],
				},
			} );
			const price = getActivePromotionRawPrice( state, 1003 );
			expect( price ).to.eql( 99 );
		} );
		test( 'should return monthly price activePromotion object', () => {
			const state = deepFreeze( {
				activePromotions: {
					items: [
						{
							product_id: 1003,
							product_slug: 'value_bundle',
							raw_price: 99,
						},
					],
				},
			} );
			const price = getActivePromotionRawPrice( state, 1003, true );
			expect( price ).to.eql( 8.25 );
		} );
		test( 'should return monthly price activePromotion object when raw price is 0', () => {
			const state = deepFreeze( {
				activePromotions: {
					items: [
						{
							product_id: 1003,
							product_slug: 'value_bundle',
							raw_price: 0,
						},
					],
				},
			} );
			const price = getActivePromotionRawPrice( state, 1003, true );
			expect( price ).to.eql( 0 );
		} );
		test( 'should return monthly price activePromotion object when term is biennial', () => {
			const state = deepFreeze( {
				activePromotions: {
					items: [
						{
							product_id: 1029,
							product_slug: 'personal-bundle-2y',
							raw_price: 240,
						},
					],
				},
			} );
			const price = getActivePromotionRawPrice( state, 1029, true );
			expect( price ).to.eql( 10 );
		} );
		test( 'should return monthly price activePromotion object when term is monthly', () => {
			const state = deepFreeze( {
				activePromotions: {
					items: [
						{
							product_id: 2003,
							product_slug: 'jetpack_premium_monthly',
							raw_price: 24,
						},
					],
				},
			} );
			const price = getActivePromotionRawPrice( state, 2003, true );
			expect( price ).to.eql( 24 );
		} );
		test( 'should return null when raw price is missing', () => {
			const state = deepFreeze( {
				activePromotions: {
					items: [
						{
							product_id: 1003,
							product_slug: 'value_bundle',
						},
					],
				},
			} );
			const price = getActivePromotionRawPrice( state, 1003, true );
			expect( price ).to.eql( null );
		} );
		test( 'should return null when activePromotion is not available', () => {
			const state = deepFreeze( {
				activePromotions: {
					items: [
						{
							product_id: 1003,
							product_slug: 'value_bundle',
							raw_price: 99,
						},
					],
				},
			} );
			const price = getActivePromotionRawPrice( state, 44, true );
			expect( price ).to.eql( null );
		} );
	} );

	describe( '#getACTIVE_PROMOTIONSlug()', () => {
		test( 'should return activePromotion product_slug', () => {
			const state = {
				activePromotions: {
					items: [
						{
							product_id: 1003,
							product_slug: 'value_bundle',
						},
					],
				},
			};

			const activePromotionSlug = getACTIVE_PROMOTIONSlug( state, 1003 );

			expect( activePromotionSlug ).to.equal( 'value_bundle' );
		} );

		test( 'should return null if activePromotion is missing', () => {
			const state = {
				activePromotions: {
					items: [
						{
							product_id: 1003,
							product_slug: 'value_bundle',
						},
					],
				},
			};

			const activePromotionSlug = getACTIVE_PROMOTIONSlug( state, 1337 );

			expect( activePromotionSlug ).to.equal( null );
		} );

		test( "should return null if activePromotion doesn't have product_slug", () => {
			const state = {
				activePromotions: {
					items: [
						{
							product_id: 1003,
						},
					],
				},
			};

			const activePromotionSlug = getACTIVE_PROMOTIONSlug( state, 1003 );

			expect( activePromotionSlug ).to.equal( null );
		} );
	} );
} );
