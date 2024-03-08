import wpcom from 'calypso/lib/wp';
import {
	MEMBERSHIPS_COUPONS_LIST,
	MEMBERSHIPS_COUPON_ADD,
	MEMBERSHIPS_COUPON_ADD_FAILURE,
	MEMBERSHIPS_COUPON_DELETE,
	MEMBERSHIPS_COUPON_DELETE_FAILURE,
	MEMBERSHIPS_COUPON_RECEIVE,
	MEMBERSHIPS_COUPON_UPDATE,
	MEMBERSHIPS_COUPON_UPDATE_FAILURE,
} from 'calypso/state/action-types';
import { membershipCouponFromApi } from 'calypso/state/data-layer/wpcom/sites/memberships';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import 'calypso/state/memberships/init';

export const requestCoupons = ( siteId ) => ( {
	siteId,
	type: MEMBERSHIPS_COUPONS_LIST,
} );

export function receiveUpdateCoupon( siteId, coupon ) {
	return {
		coupon,
		siteId,
		type: MEMBERSHIPS_COUPON_RECEIVE,
	};
}

export function receiveDeleteCoupon( siteId, couponId ) {
	return {
		couponId,
		siteId,
		type: MEMBERSHIPS_COUPON_DELETE,
	};
}

export const requestAddCoupon = ( siteId, coupon, noticeText ) => {
	return ( dispatch ) => {
		dispatch( {
			coupon,
			siteId,
			type: MEMBERSHIPS_COUPON_ADD,
		} );

		return wpcom.req
			.post(
				{
					method: 'POST',
					path: `/sites/${ siteId }/memberships/coupons`,
					apiNamespace: 'wpcom/v2',
				},
				coupon
			)
			.then( ( newCoupon ) => {
				if ( newCoupon.error ) {
					throw new Error( newCoupon.error );
				}
				const membershipCoupon = membershipCouponFromApi( newCoupon );
				dispatch( receiveUpdateCoupon( siteId, membershipCoupon ) );
				if ( noticeText ) {
					dispatch(
						successNotice( noticeText, {
							duration: 5000,
						} )
					);
				}
				return membershipCoupon;
			} )
			.catch( ( error ) => {
				dispatch( {
					error,
					siteId,
					type: MEMBERSHIPS_COUPON_ADD_FAILURE,
				} );
				dispatch(
					errorNotice( error.message, {
						duration: 10000,
					} )
				);
			} );
	};
};

export const requestUpdateCoupon = ( siteId, coupon, noticeText ) => {
	return ( dispatch ) => {
		dispatch( {
			type: MEMBERSHIPS_COUPON_UPDATE,
			siteId,
			coupon,
		} );

		return wpcom.req
			.post(
				{
					method: 'PUT',
					path: `/sites/${ siteId }/memberships/coupon/${ coupon.ID }`,
					apiNamespace: 'wpcom/v2',
				},
				coupon
			)
			.then( ( newCoupon ) => {
				const membershipCoupon = membershipCouponFromApi( newCoupon );
				dispatch( receiveUpdateCoupon( siteId, membershipCoupon ) );
				if ( noticeText ) {
					dispatch(
						successNotice( noticeText, {
							duration: 5000,
						} )
					);
				}
				return membershipCoupon;
			} )
			.catch( ( error ) => {
				dispatch( {
					type: MEMBERSHIPS_COUPON_UPDATE_FAILURE,
					siteId,
					error,
				} );
				dispatch(
					errorNotice( error.message, {
						duration: 10000,
					} )
				);
			} );
	};
};

export const requestDeleteCoupon = ( siteId, coupon, noticeText ) => {
	return ( dispatch ) => {
		dispatch( {
			type: MEMBERSHIPS_COUPON_DELETE,
			siteId,
			coupon,
		} );

		return wpcom.req
			.post( {
				method: 'DELETE',
				path: `/sites/${ siteId }/memberships/coupon/${ coupon.ID }`,
				apiNamespace: 'wpcom/v2',
			} )
			.then( () => {
				dispatch(
					successNotice( noticeText, {
						duration: 5000,
					} )
				);
				return coupon.ID;
			} )
			.catch( ( error ) => {
				dispatch( {
					type: MEMBERSHIPS_COUPON_DELETE_FAILURE,
					siteId,
					error,
					coupon,
				} );
				dispatch(
					errorNotice( error.message, {
						duration: 10000,
					} )
				);
			} );
	};
};
