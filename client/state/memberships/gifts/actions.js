import wpcom from 'calypso/lib/wp';
import {
	MEMBERSHIPS_GIFT_ADD,
	MEMBERSHIPS_GIFT_ADD_FAILURE,
	MEMBERSHIPS_GIFT_DELETE,
	MEMBERSHIPS_GIFT_DELETE_FAILURE,
} from 'calypso/state/action-types';
import { membershipGiftFromApi } from 'calypso/state/data-layer/wpcom/sites/memberships';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import 'calypso/state/memberships/init';

export function receiveDeleteCoupon( siteId, couponId ) {
	return {
		couponId,
		siteId,
		type: MEMBERSHIPS_GIFT_DELETE,
	};
}

export const requestAddGift = ( siteId, gift, noticeText ) => {
	return ( dispatch ) => {
		dispatch( {
			gift,
			siteId,
			type: MEMBERSHIPS_GIFT_ADD,
		} );

		return wpcom.req
			.post(
				{
					method: 'POST',
					path: `/sites/${ siteId }/memberships/gifts/` + gift.user_id + '/' + gift.plan_id,
					apiNamespace: 'wpcom/v2',
				},
				null
			)
			.then( ( newGift ) => {
				if ( newGift.error ) {
					throw new Error( newGift.error );
				}
				const membershipGift = membershipGiftFromApi( newGift );
				if ( noticeText ) {
					dispatch(
						successNotice( noticeText, {
							duration: 5000,
						} )
					);
				}
				return membershipGift;
			} )
			.catch( ( error ) => {
				dispatch( {
					error,
					siteId,
					type: MEMBERSHIPS_GIFT_ADD_FAILURE,
				} );
				dispatch(
					errorNotice( error.message, {
						duration: 10000,
					} )
				);
			} );
	};
};

export const requestDeleteGift = ( siteId, gift, noticeText ) => {
	return ( dispatch ) => {
		dispatch( {
			type: MEMBERSHIPS_GIFT_DELETE,
			siteId,
			gift,
		} );

		return wpcom.req
			.post( {
				method: 'DELETE',
				path: `/sites/${ siteId }/memberships/gift/${ gift.gift_id }`,
				apiNamespace: 'wpcom/v2',
			} )
			.then( () => {
				dispatch(
					successNotice( noticeText, {
						duration: 5000,
					} )
				);
				return gift.gift_id;
			} )
			.catch( ( error ) => {
				dispatch( {
					type: MEMBERSHIPS_GIFT_DELETE_FAILURE,
					siteId,
					error,
					gift,
				} );
				dispatch(
					errorNotice( error.message, {
						duration: 10000,
					} )
				);
			} );
	};
};
