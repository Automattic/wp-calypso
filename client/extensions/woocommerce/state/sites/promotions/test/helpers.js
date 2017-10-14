/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	createPromotionFromProduct,
	createPromotionFromCoupon,
	isCategoryExplicitlySelected,
	isCategorySelected,
	isProductExplicitlySelected,
	isProductSelected,
} from '../helpers';
import { product1, product2 } from './fixtures/products';
import { coupon1, coupon2, coupon3 } from './fixtures/coupons';

describe( 'helpers', () => {
	describe( '#createPromotionFromProduct', () => {
		test( 'should set fields from product', () => {
			const promotion = createPromotionFromProduct( product1 );

			expect( promotion.id ).to.exist;
			expect( promotion.type ).to.equal( 'product_sale' );
			expect( promotion.name ).to.equal( product1.name );
			expect( promotion.salePrice ).to.equal( product1.sale_price );
			expect( promotion.startDate ).to.equal( product1.date_on_sale_from_gmt );
			expect( promotion.endDate ).to.equal( product1.date_on_sale_to_gmt );
		} );

		test( 'should set appliesTo.productIds', () => {
			const promotion = createPromotionFromProduct( product1 );

			expect( promotion.appliesTo ).to.exist;
			expect( promotion.appliesTo.productIds ).to.exist;
			expect( promotion.appliesTo.productIds.length ).to.equal( 1 );
			expect( promotion.appliesTo.productIds[ 0 ] ).to.equal( product1.id );
			expect( promotion.appliesTo.all ).to.not.exist;
			expect( promotion.appliesTo.productCategoryIds ).to.not.exist;
		} );
	} );

	describe( '#createPromotionFromCoupon', () => {
		test( 'should set fields from coupon', () => {
			const promotion = createPromotionFromCoupon( coupon1 );

			expect( promotion.id ).to.exist;
			expect( promotion.name ).to.equal( coupon1.code );
			expect( promotion.type ).to.equal( 'percent' );
			expect( promotion.couponCode ).to.equal( coupon1.code );
			expect( promotion.amount ).to.equal( coupon1.amount );
			expect( promotion.startDate ).to.equal( coupon1.date_created_gmt );
			expect( promotion.endDate ).to.equal( coupon1.date_expires_gmt );
		} );

		test( 'should set constraints from coupon', () => {
			const coupon = { ...coupon1, ...{
				individual_use: true,
				usage_limit: 20,
				usage_limit_per_user: 1,
				free_shipping: true,
				minimum_amount: '10',
				maximum_amount: '25',
			} };

			const promotion = createPromotionFromCoupon( coupon );

			expect( promotion.individualUse ).to.be.true;
			expect( promotion.usageLimit ).to.equal( 20 );
			expect( promotion.usageLimitPerUser ).to.equal( 1 );
			expect( promotion.freeShipping ).to.be.true;
			expect( promotion.minimumAmount ).to.equal( '10' );
			expect( promotion.maximumAmount ).to.equal( '25' );
		} );

		test( 'should set appliesTo.all from coupon', () => {
			const promotion = createPromotionFromCoupon( coupon1 );

			expect( promotion.appliesTo ).to.exist;
			expect( promotion.appliesTo.all ).to.be.true;
			expect( promotion.appliesTo.productIds ).to.not.exist;
			expect( promotion.appliesTo.productCategoryIds ).to.not.exist;
		} );

		test( 'should set appliesTo.productIds ', () => {
			const promotion = createPromotionFromCoupon( coupon2 );

			expect( promotion.appliesTo ).to.exist;
			expect( promotion.appliesTo.all ).to.be.false;
			expect( promotion.appliesTo.productIds ).to.exist;
			expect( promotion.appliesTo.productIds.length ).to.equal( 1 );
			expect( promotion.appliesTo.productIds[ 0 ] ).to.equal( 1 );
			expect( promotion.appliesTo.productCategoryIds ).to.not.exist;
		} );

		test( 'should set appliesTo.productCategoryIds ', () => {
			const promotion = createPromotionFromCoupon( coupon3 );

			expect( promotion.appliesTo ).to.exist;
			expect( promotion.appliesTo.all ).to.be.false;
			expect( promotion.appliesTo.productIds ).to.not.exist;
			expect( promotion.appliesTo.productCategoryIds ).to.exist;
			expect( promotion.appliesTo.productCategoryIds.length ).to.equal( 1 );
			expect( promotion.appliesTo.productCategoryIds[ 0 ] ).to.equal( 22 );
		} );
	} );

	describe( '#isCategoryExplicitlySelected', () => {
		test( 'should explicitly select a category for a coupon', () => {
			const promotion = createPromotionFromCoupon( coupon3 );
			const category = { id: 22 };

			expect( isCategoryExplicitlySelected( promotion, category ) ).to.be.true;
		} );
	} );

	describe( '#isCategorySelected', () => {
		const category = { id: 22 };

		test( 'should indicate explicit category selection', () => {
			const promotion = createPromotionFromCoupon( coupon3 );

			expect( isCategorySelected( promotion, category ) ).to.be.true;
		} );

		test( 'should indictate implicit category selection by all', () => {
			const promotion = createPromotionFromCoupon( coupon1 );

			expect( isCategorySelected( promotion, category ) ).to.be.true;
		} );
	} );

	describe( '#isProductExplicitlySelected', () => {
		test( 'should explicitly select a product for a product_sale', () => {
			const promotion = createPromotionFromProduct( product1 );

			expect( isProductExplicitlySelected( promotion, product1 ) ).to.be.true;
		} );

		test( 'should explicitly select a product for a coupon', () => {
			const promotion = createPromotionFromCoupon( coupon2 );

			expect( isProductExplicitlySelected( promotion, product1 ) ).to.be.true;
		} );
	} );

	describe( '#isProductSelected', () => {
		test( 'should indicate explicit product selection', () => {
			const promotion = createPromotionFromCoupon( coupon2 );

			expect( isProductSelected( promotion, product1 ) ).to.be.true;
		} );

		test( 'should indicate implicit product selection by category', () => {
			const promotion = createPromotionFromCoupon( coupon3 );

			expect( isProductSelected( promotion, product1 ) ).to.be.true;
		} );

		test( 'should indicate implicit product selection by all', () => {
			const promotion = createPromotionFromCoupon( coupon1 );

			expect( isProductSelected( promotion, product1 ) ).to.be.true;
		} );

		test( 'should not indicate implicit product selection if category not selected', () => {
			const promotion = createPromotionFromCoupon( coupon3 );

			expect( isProductSelected( promotion, product2 ) ).to.be.false;
		} );
	} );
} );
