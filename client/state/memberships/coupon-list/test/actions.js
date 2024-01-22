import nock from 'nock';
import {
	MEMBERSHIPS_COUPONS_LIST,
	MEMBERSHIPS_COUPON_RECEIVE,
	MEMBERSHIPS_COUPON_DELETE,
} from 'calypso/state/action-types';
import {
	COUPON_DISCOUNT_TYPE_PERCENTAGE,
	COUPON_DURATION_FOREVER,
} from '../../../../my-sites/earn/memberships/constants';
import {
	requestCoupons,
	receiveUpdateCoupon,
	receiveDeleteCoupon,
	requestAddCoupon,
	requestUpdateCoupon,
	requestDeleteCoupon,
} from '../actions';

const mockCoupon = {
	coupon_code: 'COUPON4',
	discount_type: COUPON_DISCOUNT_TYPE_PERCENTAGE,
	discount_value: 50,
	discount_percentage: 50,
	start_date: '2023-12-20',
	end_date: undefined,
	plan_ids_allow_list: [],
	cannot_be_combined: true,
	can_be_combined: false, //TODO: remove when backend switches to cannot_be_combined
	first_time_purchase_only: false,
	duration: COUPON_DURATION_FOREVER,
	email_allow_list: [],
};

describe( 'actions', () => {
	describe( 'requestCoupons()', () => {
		test( 'should return an action object', () => {
			expect( requestCoupons( 123 ) ).toEqual( {
				siteId: 123,
				type: MEMBERSHIPS_COUPONS_LIST,
			} );
		} );
	} );

	describe( 'receiveUpdateCoupon()', () => {
		test( 'should return an action object with the new coupon', () => {
			expect( receiveUpdateCoupon( 123, {} ) ).toEqual( {
				coupon: {},
				siteId: 123,
				type: MEMBERSHIPS_COUPON_RECEIVE,
			} );
		} );
	} );

	describe( 'receiveDeleteCoupon()', () => {
		test( 'should return an action object with the couponId', () => {
			expect( receiveDeleteCoupon( 123, 456 ) ).toEqual( {
				couponId: 456,
				siteId: 123,
				type: MEMBERSHIPS_COUPON_DELETE,
			} );
		} );
	} );

	describe( 'requestAddCoupon()', () => {
		test( 'should dispatch add coupon failure and error notice on failure', async () => {
			const siteId = 1;
			const coupon = mockCoupon;
			nock( 'https://public-api.wordpress.com' )
				.post( '/wpcom/v2/sites/1/memberships/coupons' )
				.replyWithError( { code: 'validation_error', message: 'Coupon code is already used' } );
			const noticeText = 'Added coupon';
			const dispatchedActions = [];

			const dispatch = ( obj ) => dispatchedActions.push( obj );
			await requestAddCoupon( siteId, coupon, noticeText )( dispatch );

			const [ addAction, addFailureAction, noticeCreateAction ] = dispatchedActions;
			expect( addAction ).toHaveProperty( 'coupon' );
			expect( addAction ).toHaveProperty( 'siteId' );
			expect( addAction ).toHaveProperty( 'type' );
			expect( addFailureAction ).toHaveProperty( 'error' );
			expect( addFailureAction ).toHaveProperty( 'siteId' );
			expect( addFailureAction ).toHaveProperty( 'type' );
			expect( noticeCreateAction ).toHaveProperty( 'notice' );
			expect( noticeCreateAction ).toHaveProperty( 'type' );
		} );

		test( 'should dispatch an http request to the add coupon endpoint and associated actions', async () => {
			const siteId = 1;
			const couponId = '123';
			const coupon = mockCoupon;
			nock( 'https://public-api.wordpress.com' )
				.post( '/wpcom/v2/sites/1/memberships/coupons' )
				.reply( 200, { id: couponId, ...coupon } );
			const noticeText = 'Added coupon';
			const dispatchedActions = [];
			const dispatch = ( obj ) => dispatchedActions.push( obj );

			await requestAddCoupon( siteId, coupon, noticeText )( dispatch );

			const [ addAction, receiveAction, noticeCreateAction ] = dispatchedActions;
			expect( addAction ).toHaveProperty( 'coupon' );
			expect( addAction ).toHaveProperty( 'siteId' );
			expect( addAction ).toHaveProperty( 'type' );
			expect( receiveAction ).toHaveProperty( 'coupon' );
			expect( receiveAction.coupon ).toHaveProperty( 'ID' );
			expect( receiveAction ).toHaveProperty( 'siteId' );
			expect( receiveAction ).toHaveProperty( 'type' );
			expect( noticeCreateAction ).toHaveProperty( 'notice' );
			expect( noticeCreateAction ).toHaveProperty( 'type' );
		} );
	} );

	describe( 'requestUpdateCoupon()', () => {
		test( 'should dispatch update coupon failure and error notice on failure', async () => {
			const siteId = 1;
			const couponId = '123';
			const coupon = {
				...mockCoupon,
				discount_value: 5,
				discount_percentage: 0,
				start_date: '2023-12-20',
				end_date: '2024-04-12',
				first_time_purchase_only: true,
				email_allow_list: [ '*@*.edu' ],
			};
			const couponContainingId = { ID: parseInt( couponId ), ...coupon };
			nock( 'https://public-api.wordpress.com' )
				.put( '/wpcom/v2/sites/1/memberships/coupon/123' )
				.replyWithError( {
					code: 'other_error',
					message: 'Something went wrong updating this coupon.',
				} );
			const noticeText = 'Updated coupon';
			const dispatchedActions = [];

			const dispatch = ( obj ) => dispatchedActions.push( obj );
			await requestUpdateCoupon( siteId, couponContainingId, noticeText )( dispatch );

			const [ updateAction, updateFailureAction, noticeCreateAction ] = dispatchedActions;
			expect( updateAction ).toHaveProperty( 'coupon' );
			expect( updateAction ).toHaveProperty( 'siteId' );
			expect( updateAction ).toHaveProperty( 'type' );
			expect( updateFailureAction ).toHaveProperty( 'error' );
			expect( updateFailureAction ).toHaveProperty( 'siteId' );
			expect( updateFailureAction ).toHaveProperty( 'type' );
			expect( noticeCreateAction ).toHaveProperty( 'notice' );
			expect( noticeCreateAction ).toHaveProperty( 'type' );
		} );

		test( 'should dispatch an http request to the update coupon endpoint and associated actions', async () => {
			const siteId = 1;
			const couponId = '123';
			const coupon = {
				...mockCoupon,
				discount_value: 5,
				discount_percentage: 0,
				start_date: '2023-12-20',
				end_date: '2024-04-12',
				first_time_purchase_only: true,
				email_allow_list: [ '*@*.edu' ],
			};
			const couponContainingId = { ID: parseInt( couponId ), ...coupon };
			nock( 'https://public-api.wordpress.com' )
				.put( '/wpcom/v2/sites/1/memberships/coupon/123' )
				.reply( 200, { id: couponId, ...coupon } );
			const noticeText = 'Updated coupon';
			const dispatchedActions = [];
			const dispatch = ( obj ) => dispatchedActions.push( obj );
			await requestUpdateCoupon( siteId, couponContainingId, noticeText )( dispatch );

			const [ updateAction, receiveAction, noticeCreateAction ] = dispatchedActions;
			expect( updateAction ).toHaveProperty( 'coupon' );
			expect( updateAction ).toHaveProperty( 'siteId' );
			expect( updateAction ).toHaveProperty( 'type' );
			expect( receiveAction ).toHaveProperty( 'coupon' );
			expect( receiveAction ).toHaveProperty( 'siteId' );
			expect( receiveAction ).toHaveProperty( 'type' );
			expect( noticeCreateAction ).toHaveProperty( 'notice' );
			expect( noticeCreateAction ).toHaveProperty( 'type' );
		} );
	} );

	describe( 'requestDeleteCoupon()', () => {
		test( 'should dispatch delete coupon failure and error notice on failure', async () => {
			const siteId = 1;
			const couponId = '123';
			const coupon = {
				...mockCoupon,
				discount_value: 5,
				discount_percentage: 0,
				start_date: '2023-12-20',
				end_date: '2024-04-12',
				first_time_purchase_only: true,
				email_allow_list: [ '*@*.edu' ],
			};
			const couponContainingId = { ID: parseInt( couponId ), ...coupon };
			const noticeText = 'Coupon deleted';
			const dispatchedActions = [];

			nock( 'https://public-api.wordpress.com' )
				.delete( '/wpcom/v2/sites/1/memberships/coupon/123' )
				.replyWithError( {
					code: 'other_error',
					message: 'Something went wrong when deleting this coupon.',
				} );

			const dispatch = ( obj ) => dispatchedActions.push( obj );
			await requestDeleteCoupon( siteId, couponContainingId, noticeText )( dispatch );

			const [ deleteAction, deleteFailureAction, noticeCreateAction ] = dispatchedActions;
			expect( deleteAction ).toHaveProperty( 'coupon' );
			expect( deleteAction ).toHaveProperty( 'siteId' );
			expect( deleteAction ).toHaveProperty( 'type' );
			expect( deleteFailureAction ).toHaveProperty( 'error' );
			expect( deleteFailureAction ).toHaveProperty( 'siteId' );
			expect( deleteFailureAction ).toHaveProperty( 'type' );
			expect( noticeCreateAction ).toHaveProperty( 'notice' );
			expect( noticeCreateAction ).toHaveProperty( 'type' );
		} );

		test( 'should dispatch an http request to the delete coupon endpoint and associated actions', async () => {
			const siteId = 1;
			const couponId = '123';
			const coupon = {
				...mockCoupon,
				discount_value: 5,
				discount_percentage: 0,
				start_date: '2023-12-20',
				end_date: '2024-04-12',
				first_time_purchase_only: true,
				email_allow_list: [ '*@*.edu' ],
			};
			const couponContainingId = { ID: parseInt( couponId ), ...coupon };
			const noticeText = 'Coupon deleted';
			const dispatchedActions = [];
			const dispatch = ( obj ) => dispatchedActions.push( obj );
			nock( 'https://public-api.wordpress.com' )
				.delete( '/wpcom/v2/sites/1/memberships/coupon/123' )
				.reply( 200 );

			await requestDeleteCoupon( siteId, couponContainingId, noticeText )( dispatch );

			const [ deleteAction, noticeCreateAction ] = dispatchedActions;
			expect( deleteAction ).toHaveProperty( 'coupon' );
			expect( deleteAction ).toHaveProperty( 'siteId' );
			expect( deleteAction ).toHaveProperty( 'type' );
			expect( noticeCreateAction ).toHaveProperty( 'notice' );
			expect( noticeCreateAction ).toHaveProperty( 'type' );
		} );
	} );
} );
