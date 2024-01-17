import wpcom from 'calypso/lib/wp';
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
	COUPON_DISCOUNT_TYPE_AMOUNT,
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
			const coupon = {
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
			const errorReason = 'coupon already exists';
			const errorNoticeText = 'Error adding coupon: ' + errorReason;
			const noticeText = 'Added coupon';
			const dispatchedActions = [];

			const dispatch = ( obj ) => dispatchedActions.push( obj );
			jest
				.spyOn( wpcom.req, 'post' )
				.mockImplementation( () => Promise.reject( { message: errorNoticeText } ) );
			await requestAddCoupon( siteId, coupon, noticeText )( dispatch );
			expect( wpcom.req.post ).toHaveBeenCalledWith(
				{
					method: 'POST',
					path: '/sites/1/memberships/coupons',
					apiNamespace: 'wpcom/v2',
				},
				coupon
			);

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
						message: errorNoticeText,
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
			// expect( dispatchedActionsWithUniqueIdsRemoved ).toEqual( expectedActions );
			expect( dispatchedActions ).toEqual( expectedActions );
		} );

		test( 'should dispatch an http request to the add coupon endpoint and associated actions', async () => {
			const siteId = 1;
			const couponId = '123';
			const coupon = {
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
			const serverResponseWithCouponContainingId = { id: couponId, ...coupon };
			const couponContainingId = { ID: parseInt( couponId ), ...coupon };
			const noticeText = 'Added coupon';
			const dispatchedActions = [];
			const dispatch = ( obj ) => dispatchedActions.push( obj );
			jest
				.spyOn( wpcom.req, 'post' )
				.mockImplementation( () => Promise.resolve( serverResponseWithCouponContainingId ) );
			await requestAddCoupon( siteId, coupon, noticeText )( dispatch );
			expect( wpcom.req.post ).toHaveBeenCalledWith(
				{
					method: 'POST',
					path: '/sites/1/memberships/coupons',
					apiNamespace: 'wpcom/v2',
				},
				coupon
			);
			const dispatchedActionsWithUniqueIdsRemoved = dispatchedActions.map( ( action ) => {
				if ( action.notice?.noticeId?.length > 0 ) {
					action.notice.noticeId = 'UNIQUE-ID';
				}
				return action;
			} );
			const expectedActions = [
				{
					coupon,
					siteId,
					type: MEMBERSHIPS_COUPON_ADD,
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
						noticeId: 'UNIQUE-ID',
						status: 'is-success',
						text: noticeText,
					},
				},
			];
			expect( dispatchedActionsWithUniqueIdsRemoved ).toEqual( expectedActions );
		} );
	} );

	describe( 'requestUpdateCoupon()', () => {
		test( 'should dispatch update coupon failure and error notice on failure', async () => {
			const siteId = 1;
			const couponId = '123';
			const coupon = {
				coupon_code: 'COUPON4',
				discount_type: COUPON_DISCOUNT_TYPE_AMOUNT,
				discount_value: 5,
				discount_percentage: 0,
				start_date: '2023-12-20',
				end_date: '2024-04-12',
				plan_ids_allow_list: [],
				cannot_be_combined: true,
				can_be_combined: false, //TODO: remove when backend switches to cannot_be_combined
				first_time_purchase_only: true,
				duration: COUPON_DURATION_FOREVER,
				email_allow_list: [ '*@*.edu' ],
			};
			const couponContainingId = { ID: parseInt( couponId ), ...coupon };
			const errorReason = 'Unknown';
			const errorNoticeText = 'Error updating coupon: ' + errorReason;
			const noticeText = 'Updated coupon';
			const dispatchedActions = [];

			const dispatch = ( obj ) => dispatchedActions.push( obj );
			jest
				.spyOn( wpcom.req, 'post' )
				.mockImplementation( () => Promise.reject( { message: errorNoticeText } ) );
			await requestUpdateCoupon( siteId, couponContainingId, noticeText )( dispatch );
			expect( wpcom.req.post ).toHaveBeenCalledWith(
				{
					method: 'PUT',
					path: '/sites/1/memberships/coupon/' + couponId,
					apiNamespace: 'wpcom/v2',
				},
				couponContainingId
			);
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
						message: errorNoticeText,
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
						text: errorNoticeText,
					},
				},
			];
			expect( dispatchedActions ).toEqual( expectedActions );
		} );

		test( 'should dispatch an http request to the update coupon endpoint and associated actions', async () => {
			const siteId = 1;
			const couponId = '123';
			const coupon = {
				coupon_code: 'COUPON4',
				discount_type: COUPON_DISCOUNT_TYPE_AMOUNT,
				discount_value: 5,
				discount_percentage: 0,
				start_date: '2023-12-20',
				end_date: '2024-04-12',
				plan_ids_allow_list: [],
				cannot_be_combined: true,
				can_be_combined: false, //TODO: remove when backend switches to cannot_be_combined
				first_time_purchase_only: true,
				duration: COUPON_DURATION_FOREVER,
				email_allow_list: [ '*@*.edu' ],
			};
			const serverResponseWithCouponContainingId = { id: couponId, ...coupon };
			const couponContainingId = { ID: parseInt( couponId ), ...coupon };
			const noticeText = 'Updated coupon';
			const dispatchedActions = [];
			const dispatch = ( obj ) => dispatchedActions.push( obj );
			jest
				.spyOn( wpcom.req, 'post' )
				.mockImplementation( () => Promise.resolve( serverResponseWithCouponContainingId ) );
			await requestUpdateCoupon( siteId, couponContainingId, noticeText )( dispatch );
			expect( wpcom.req.post ).toHaveBeenCalledWith(
				{
					method: 'PUT',
					path: '/sites/1/memberships/coupon/' + couponId,
					apiNamespace: 'wpcom/v2',
				},
				couponContainingId
			);
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
				coupon_code: 'COUPON4',
				discount_type: COUPON_DISCOUNT_TYPE_AMOUNT,
				discount_value: 5,
				discount_percentage: 0,
				start_date: '2023-12-20',
				end_date: '2024-04-12',
				plan_ids_allow_list: [],
				cannot_be_combined: true,
				can_be_combined: false, //TODO: remove when backend switches to cannot_be_combined
				first_time_purchase_only: true,
				duration: COUPON_DURATION_FOREVER,
				email_allow_list: [ '*@*.edu' ],
			};
			const couponContainingId = { ID: parseInt( couponId ), ...coupon };
			const errorReason = 'Unknown';
			const errorNoticeText = 'Error updating coupon: ' + errorReason;
			const noticeText = 'Coupon deleted';
			const dispatchedActions = [];

			const dispatch = ( obj ) => dispatchedActions.push( obj );
			jest
				.spyOn( wpcom.req, 'post' )
				.mockImplementation( () => Promise.reject( { message: errorNoticeText } ) );
			await requestDeleteCoupon( siteId, couponContainingId, noticeText )( dispatch );
			expect( wpcom.req.post ).toHaveBeenCalledWith( {
				method: 'DELETE',
				path: '/sites/1/memberships/coupon/' + couponId,
				apiNamespace: 'wpcom/v2',
			} );
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
						message: errorNoticeText,
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
						text: errorNoticeText,
					},
				},
			];
			expect( dispatchedActions ).toEqual( expectedActions );
		} );

		test( 'should dispatch an http request to the delete coupon endpoint and associated actions', async () => {
			const siteId = 1;
			const couponId = '123';
			const coupon = {
				coupon_code: 'COUPON4',
				discount_type: COUPON_DISCOUNT_TYPE_AMOUNT,
				discount_value: 5,
				discount_percentage: 0,
				start_date: '2023-12-20',
				end_date: '2024-04-12',
				plan_ids_allow_list: [],
				cannot_be_combined: true,
				can_be_combined: false, //TODO: remove when backend switches to cannot_be_combined
				first_time_purchase_only: true,
				duration: COUPON_DURATION_FOREVER,
				email_allow_list: [ '*@*.edu' ],
			};
			const couponContainingId = { ID: parseInt( couponId ), ...coupon };
			const noticeText = 'Coupon deleted';
			const dispatchedActions = [];
			const dispatch = ( obj ) => dispatchedActions.push( obj );
			jest
				.spyOn( wpcom.req, 'post' )
				.mockImplementation( () => Promise.resolve( { success: true } ) );
			await requestDeleteCoupon( siteId, couponContainingId, noticeText )( dispatch );
			expect( wpcom.req.post ).toHaveBeenCalledWith( {
				method: 'DELETE',
				path: '/sites/1/memberships/coupon/' + couponId,
				apiNamespace: 'wpcom/v2',
			} );
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
