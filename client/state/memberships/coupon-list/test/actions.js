import nock from 'nock';
import {
	MEMBERSHIPS_COUPONS_LIST,
	MEMBERSHIPS_COUPON_RECEIVE,
	MEMBERSHIPS_COUPON_DELETE,
	MEMBERSHIPS_COUPON_ADD,
	NOTICE_CREATE,
	MEMBERSHIPS_COUPON_UPDATE,
	MEMBERSHIPS_COUPON_ADD_FAILURE,
	MEMBERSHIPS_COUPON_UPDATE_FAILURE,
	MEMBERSHIPS_COUPON_DELETE_FAILURE,
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

beforeEach( () => {
	jest.resetAllMocks();
} );

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
			const errorNoticeText = 'Coupon code is already used';
			const noticeText = 'Added coupon';
			const dispatchedActions = [];

			const dispatch = ( obj ) => dispatchedActions.push( obj );
			await requestAddCoupon( siteId, coupon, noticeText )( dispatch );

			// dispatchedActions will include a randomly-generated noticeId.
			// We need to include that random id in our expectation.
			const noticeId = dispatchedActions[ 2 ].notice.noticeId;

			const expectedActions = [
				{
					coupon,
					siteId,
					type: MEMBERSHIPS_COUPON_ADD,
				},
				{
					error: {
						message: 'Coupon code is already used',
						code: 'validation_error',
						response: undefined,
					},
					siteId,
					type: MEMBERSHIPS_COUPON_ADD_FAILURE,
				},
				{
					type: NOTICE_CREATE,
					notice: {
						showDismiss: true,
						duration: 10000,
						noticeId,
						status: 'is-error',
						text: errorNoticeText,
					},
				},
			];
			expect( dispatchedActions ).toEqual( expectedActions );
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

			// dispatchedActions will include a randomly-generated noticeId.
			// We need to include that random id in our expectation.
			await requestAddCoupon( siteId, coupon, noticeText )( dispatch );

			const noticeId = dispatchedActions[ 2 ].notice.noticeId;
			const expectedActions = [
				{
					coupon,
					siteId,
					type: MEMBERSHIPS_COUPON_ADD,
				},
				{
					coupon: { ID: parseInt( couponId ), ...coupon },
					siteId,
					type: MEMBERSHIPS_COUPON_RECEIVE,
				},
				{
					type: NOTICE_CREATE,
					notice: {
						showDismiss: true,
						duration: 5000,
						noticeId,
						status: 'is-success',
						text: noticeText,
					},
				},
			];
			expect( dispatchedActions ).toEqual( expectedActions );
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
			// dispatchedActions will include a randomly-generated noticeId.
			// We need to include that random id in our expectation.
			const noticeId = dispatchedActions[ 2 ].notice.noticeId;
			const expectedActions = [
				{
					coupon: couponContainingId,
					siteId,
					type: MEMBERSHIPS_COUPON_UPDATE,
				},
				{
					error: {
						message: 'Something went wrong updating this coupon.',
						code: 'other_error',
						response: undefined,
					},
					siteId,
					type: MEMBERSHIPS_COUPON_UPDATE_FAILURE,
				},
				{
					type: NOTICE_CREATE,
					notice: {
						showDismiss: true,
						duration: 10000,
						noticeId,
						status: 'is-error',
						text: 'Something went wrong updating this coupon.',
					},
				},
			];
			expect( dispatchedActions ).toEqual( expectedActions );
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
			// dispatchedActions will include a randomly-generated noticeId.
			// We need to include that random id in our expectation.
			const noticeId = dispatchedActions[ 2 ].notice.noticeId;
			const expectedActions = [
				{
					coupon: couponContainingId,
					siteId,
					type: MEMBERSHIPS_COUPON_UPDATE,
				},
				{
					coupon: couponContainingId,
					siteId,
					type: MEMBERSHIPS_COUPON_RECEIVE,
				},
				{
					type: NOTICE_CREATE,
					notice: {
						showDismiss: true,
						duration: 5000,
						noticeId,
						status: 'is-success',
						text: noticeText,
					},
				},
			];
			expect( dispatchedActions ).toEqual( expectedActions );
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
			// dispatchedActions will include a randomly-generated noticeId.
			// We need to include that random id in our expectation.
			const noticeId = dispatchedActions[ 2 ].notice.noticeId;
			const expectedActions = [
				{
					coupon: couponContainingId,
					siteId,
					type: MEMBERSHIPS_COUPON_DELETE,
				},
				{
					error: {
						message: 'Something went wrong when deleting this coupon.',
						code: 'other_error',
						response: undefined,
					},
					coupon: couponContainingId,
					siteId,
					type: MEMBERSHIPS_COUPON_DELETE_FAILURE,
				},
				{
					type: NOTICE_CREATE,
					notice: {
						showDismiss: true,
						duration: 10000,
						noticeId,
						status: 'is-error',
						text: 'Something went wrong when deleting this coupon.',
					},
				},
			];
			expect( dispatchedActions ).toEqual( expectedActions );
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

			// dispatchedActions will include a randomly-generated noticeId.
			// We need to include that random id in our expectation.
			const noticeId = dispatchedActions[ 1 ].notice.noticeId;
			const expectedActions = [
				{
					coupon: couponContainingId,
					siteId,
					type: MEMBERSHIPS_COUPON_DELETE,
				},
				{
					type: NOTICE_CREATE,
					notice: {
						showDismiss: true,
						duration: 5000,
						noticeId,
						status: 'is-success',
						text: noticeText,
					},
				},
			];
			expect( dispatchedActions ).toEqual( expectedActions );
		} );
	} );
} );
