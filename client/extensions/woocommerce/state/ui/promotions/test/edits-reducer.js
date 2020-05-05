/**
 * External dependencies
 *
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../edits-reducer';
import {
	WOOCOMMERCE_PROMOTION_EDIT,
	WOOCOMMERCE_PROMOTION_EDIT_CLEAR,
} from 'woocommerce/state/action-types';
import { coupons1 } from 'woocommerce/state/sites/promotions/test/fixtures/promotions';

describe( 'edits-reducer', () => {
	const siteId = 123;

	test( 'should initialize to null', () => {
		expect( reducer( undefined, { type: '%%NONE%%' } ) ).to.equal( null );
	} );

	test( 'should create "updates" upon first edit', () => {
		const coupon = coupons1[ 0 ];
		const promotion = { id: 'coupon:' + coupon.id, name: coupon.code, coupon };
		const action = {
			type: WOOCOMMERCE_PROMOTION_EDIT,
			siteId,
			promotion,
			data: { coupon: { ...coupon, amount: '18' } },
		};

		const state = reducer( undefined, action );

		expect( state.updates ).to.exist;
		expect( state.updates[ 0 ] ).to.exist;
		expect( state.updates[ 0 ].id ).to.equal( promotion.id );
		expect( state.updates[ 0 ].coupon ).to.exist;
		expect( state.updates[ 0 ].coupon.code ).to.equal( coupon.code );
		expect( state.updates[ 0 ].coupon.amount ).to.equal( '18' );
	} );

	test( 'should modify "updates" on second edit', () => {
		const coupon = coupons1[ 0 ];
		const promotion = { id: 'coupon:' + coupon.id, name: coupon.code, coupon };
		const action1 = {
			type: WOOCOMMERCE_PROMOTION_EDIT,
			siteId,
			promotion,
			data: { coupon: { ...coupon, amount: '18' } },
		};
		const action2 = {
			type: WOOCOMMERCE_PROMOTION_EDIT,
			siteId,
			promotion,
			data: { name: 'test_code', coupon: { ...coupon, code: 'test_code' } },
		};

		const state1 = reducer( undefined, action1 );
		const state2 = reducer( state1, action2 );

		expect( state1.updates[ 0 ].coupon.code ).to.equal( coupon.code );
		expect( state2.updates[ 0 ].coupon.code ).to.equal( 'test_code' );
	} );

	test( 'should create updates for more than one existing promotion', () => {
		const coupon1 = coupons1[ 0 ];
		const promotion1 = { id: 'coupon:' + coupon1.id, name: coupon1.code, coupon: coupon1 };
		const coupon2 = coupons1[ 1 ];
		const promotion2 = { id: 'coupon:' + coupon2.id, name: coupon2.code, coupon: coupon2 };
		const action1 = {
			type: WOOCOMMERCE_PROMOTION_EDIT,
			siteId,
			promotion: promotion1,
			data: { coupon: { ...coupon1, amount: '111' } },
		};
		const action2 = {
			type: WOOCOMMERCE_PROMOTION_EDIT,
			siteId,
			promotion: promotion2,
			data: { coupon: { ...coupon2, amount: '222' } },
		};

		const state1 = reducer( undefined, action1 );
		const state2 = reducer( state1, action2 );

		expect( state2.updates.length ).to.equal( 2 );
		expect( state2.updates[ 0 ].id ).to.equal( promotion1.id );
		expect( state2.updates[ 0 ].coupon.id ).to.equal( coupon1.id );
		expect( state2.updates[ 0 ].coupon.amount ).to.equal( '111' );
		expect( state2.updates[ 1 ].id ).to.equal( promotion2.id );
		expect( state2.updates[ 1 ].coupon.id ).to.equal( coupon2.id );
		expect( state2.updates[ 1 ].coupon.amount ).to.equal( '222' );
	} );

	test( 'should create "creates" on first edit', () => {
		const action1 = {
			type: WOOCOMMERCE_PROMOTION_EDIT,
			siteId,
			promotion: null,
			data: { name: 'ccode', coupon: { code: 'ccode', amount: '111' } },
		};

		const state1 = reducer( undefined, action1 );

		expect( state1.creates ).to.exist;
		expect( state1.creates[ 0 ].id ).to.exist;
		expect( state1.creates[ 0 ].coupon ).to.exist;
		expect( state1.creates[ 0 ].coupon.code ).to.equal( 'ccode' );
		expect( state1.creates[ 0 ].coupon.amount ).to.equal( '111' );
	} );

	test( 'should modify "creates" on second edit', () => {
		const action1 = {
			type: WOOCOMMERCE_PROMOTION_EDIT,
			siteId,
			promotion: null,
			data: { name: 'ccode', coupon: { code: 'ccode', amount: '111' } },
		};

		const state1 = reducer( undefined, action1 );
		expect( state1.creates[ 0 ].name ).to.equal( 'ccode' );
		expect( state1.creates[ 0 ].coupon.code ).to.equal( 'ccode' );

		const action2 = {
			type: WOOCOMMERCE_PROMOTION_EDIT,
			siteId,
			promotion: state1.creates[ 0 ],
			data: { name: 'c_code', coupon: { code: 'c_code', amount: '111' } },
		};

		const state2 = reducer( state1, action2 );
		expect( state2.creates[ 0 ].name ).to.equal( 'c_code' );
		expect( state2.creates[ 0 ].coupon.code ).to.equal( 'c_code' );
	} );

	test( 'should create more than one new promotion', () => {
		const action1 = {
			type: WOOCOMMERCE_PROMOTION_EDIT,
			siteId,
			promotion: null,
			data: { name: 'ccode1', coupon: { code: 'ccode1', amount: '111' } },
		};

		const action2 = {
			type: WOOCOMMERCE_PROMOTION_EDIT,
			siteId,
			promotion: null,
			data: { name: 'ccode2', coupon: { code: 'ccode2', amount: '222' } },
		};

		const state1 = reducer( undefined, action1 );
		const state2 = reducer( state1, action2 );

		expect( state2.creates[ 0 ].name ).to.equal( 'ccode1' );
		expect( state2.creates[ 0 ].coupon.code ).to.equal( 'ccode1' );
		expect( state2.creates[ 1 ].name ).to.equal( 'ccode2' );
		expect( state2.creates[ 1 ].coupon.code ).to.equal( 'ccode2' );
	} );

	test( 'should clear out edits', () => {
		const action1 = {
			type: WOOCOMMERCE_PROMOTION_EDIT,
			siteId,
			promotion: null,
			data: { name: 'ccode1', coupon: { code: 'ccode1', amount: '111' } },
		};

		const state1 = reducer( undefined, action1 );
		expect( state1.creates ).to.exist;

		const action2 = {
			type: WOOCOMMERCE_PROMOTION_EDIT_CLEAR,
			siteId,
		};

		const state2 = reducer( state1, action2 );
		expect( state2 ).to.be.null;
	} );
} );
