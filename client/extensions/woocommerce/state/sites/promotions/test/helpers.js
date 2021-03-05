/**
 * External dependencies
 */
import { expect } from 'chai';
import moment from 'moment';

/**
 * Internal dependencies
 */
import {
	createPromotionFromProduct,
	createProductUpdateFromPromotion,
	createPromotionFromCoupon,
	createCouponUpdateFromPromotion,
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
			expect( promotion.startDate ).to.equal( product1.date_on_sale_from );
			expect( promotion.endDate ).to.equal( product1.date_on_sale_to );
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

	describe( '#createProductUpdateFromPromotion', () => {
		test( 'should set product fields from promotion', () => {
			const promotion = {
				type: 'product_sale',
				salePrice: '20',
				startDate: '2017-09-20T12:12:15',
				endDate: '2017-10-22T10:10:15',
				appliesTo: { productIds: [ 52 ] },
			};

			const productData = createProductUpdateFromPromotion( promotion );

			expect( productData ).to.exist;
			expect( productData.id ).to.equal( 52 );
			expect( productData.date_on_sale_from ).to.equal( promotion.startDate );
			expect( productData.date_on_sale_to ).to.equal( promotion.endDate );
		} );

		test( 'should default dates to today if they are null', () => {
			const promotion = {
				type: 'product_sale',
				salePrice: '20',
				startDate: null,
				endDate: null,
				appliesTo: { productIds: [ 52 ] },
			};

			const productData = createProductUpdateFromPromotion( promotion );

			expect( productData.date_on_sale_from ).to.exist;
			expect( moment( productData.date_on_sale_from ).isSame( moment(), 'd' ) ).to.be.true;
			expect( productData.date_on_sale_to ).to.exist;
			expect( moment( productData.date_on_sale_to ).isSame( moment(), 'd' ) ).to.be.true;
		} );

		test( 'should throw if promotion does not apply to product', () => {
			const promotion = {
				type: 'product_sale',
				salePrice: '20',
				appliesTo: { productCategoryIds: [ 52 ] },
			};

			const badProductPromotionCall = () => {
				createProductUpdateFromPromotion( promotion );
			};

			expect( badProductPromotionCall ).to.throw( Error );
		} );
	} );

	describe( '#createPromotionFromCoupon', () => {
		test( 'should set fields from coupon', () => {
			const promotion = createPromotionFromCoupon( coupon1 );

			expect( promotion.id ).to.exist;
			expect( promotion.name ).to.equal( coupon1.code );
			expect( promotion.type ).to.equal( 'percent' );
			expect( promotion.couponCode ).to.equal( coupon1.code );
			expect( promotion.startDate ).to.equal( coupon1.date_created );
			expect( promotion.endDate ).to.equal( coupon1.date_expires );
		} );

		test( 'should set cart percent discount', () => {
			const promotion = createPromotionFromCoupon( coupon1 );

			expect( promotion.percentDiscount ).to.equal( coupon1.amount );
		} );

		test( 'should set cart fixed discount', () => {
			const promotion = createPromotionFromCoupon( coupon3 );

			expect( promotion.fixedDiscount ).to.equal( coupon3.amount );
		} );

		test( 'should set product fixed discount', () => {
			const promotion = createPromotionFromCoupon( coupon2 );

			expect( promotion.fixedDiscount ).to.equal( coupon2.amount );
		} );

		test( 'should set constraints from coupon', () => {
			const coupon = {
				...coupon1,
				...{
					individual_use: true,
					usage_limit: 20,
					usage_limit_per_user: 1,
					free_shipping: true,
					minimum_amount: '10',
					maximum_amount: '25',
				},
			};

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

	describe( '#createCouponUpdateFromPromotion', () => {
		test( 'should set fixed discount fields from promotion', () => {
			const promotion = {
				type: 'fixed_cart',
				couponCode: '20bucks',
				fixedDiscount: '20',
				appliesTo: { all: true },
				couponId: 25,
			};

			const couponData = createCouponUpdateFromPromotion( promotion );

			expect( couponData ).to.exist;
			expect( couponData.id ).to.equal( 25 );
			expect( couponData.discount_type ).to.equal( 'fixed_cart' );
			expect( couponData.code ).to.equal( promotion.couponCode );
			expect( couponData.amount ).to.equal( promotion.fixedDiscount );
		} );

		test( 'should set percent discount fields from promotion', () => {
			const promotion = {
				type: 'percent',
				couponCode: '10percent',
				fixedDiscount: '10',
				appliesTo: { all: true },
				couponId: 25,
			};

			const couponData = createCouponUpdateFromPromotion( promotion );

			expect( couponData ).to.exist;
			expect( couponData.id ).to.equal( 25 );
			expect( couponData.discount_type ).to.equal( 'percent' );
			expect( couponData.code ).to.equal( promotion.couponCode );
			expect( couponData.amount ).to.equal( promotion.percentDiscount );
		} );

		test( 'should set applied product ids from promotion', () => {
			const promotion = {
				type: 'percent',
				couponCode: '10percent',
				percentDiscount: '10',
				appliesTo: { productIds: [ 12, 14, 16 ] },
				couponId: 25,
			};

			const couponData = createCouponUpdateFromPromotion( promotion );

			expect( couponData ).to.exist;
			expect( couponData.id ).to.equal( 25 );
			expect( couponData.product_ids ).to.equal( promotion.appliesTo.productIds );
		} );

		test( 'should set applied product category ids from promotion', () => {
			const promotion = {
				type: 'percent',
				couponCode: '10percent',
				fixedDiscount: '10',
				appliesTo: { productCategoryIds: [ 22, 24, 26 ] },
				couponId: 25,
			};

			const couponData = createCouponUpdateFromPromotion( promotion );

			expect( couponData ).to.exist;
			expect( couponData.id ).to.equal( 25 );
			expect( couponData.product_categories ).to.equal( promotion.appliesTo.productCategoryIds );
		} );

		test( 'should set conditions on coupon from promotion', () => {
			const promotion = {
				type: 'percent',
				couponCode: '10percent',
				fixedDiscount: '20',
				appliesTo: { all: true },
				couponId: 25,
				endDate: '2017-10-22T10:10:15',
				individualUse: true,
				usageLimit: '20',
				usageLimitPerUser: '1',
				freeShipping: true,
				minimumAmount: '20',
				maximumAmount: '200',
			};

			const couponData = createCouponUpdateFromPromotion( promotion );

			expect( couponData ).to.exist;
			expect( couponData.id ).to.equal( 25 );
			expect( couponData.date_expires ).to.equal( promotion.endDate );
			expect( couponData.individual_use ).to.equal( promotion.individualUse );
			expect( couponData.usage_limit ).to.equal( promotion.usageLimit );
			expect( couponData.usage_limit_per_user ).to.equal( promotion.usageLimitPerUser );
			expect( couponData.free_shipping ).to.equal( promotion.freeShipping );
			expect( couponData.minimum_amount ).to.equal( promotion.minimumAmount );
			expect( couponData.maximum_amount ).to.equal( promotion.maximumAmount );
		} );

		test( 'should throw if promotion does not have a coupon code', () => {
			const promotion = {
				type: 'fixed_cart',
				amount: '20',
				appliesTo: { all: true },
				couponId: 25,
			};

			const badCouponPromotionCall = () => {
				createCouponUpdateFromPromotion( promotion );
			};

			expect( badCouponPromotionCall ).to.throw( Error );
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
