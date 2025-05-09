import wpcom from 'calypso/lib/wp';
import { membershipGiftFromApi } from 'calypso/state/data-layer/wpcom/sites/memberships';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import 'calypso/state/memberships/init';

export const requestAddGift = ( siteId, gift, noticeText, onConfirm ) => {
	return ( dispatch ) => {
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

				onConfirm();

				return membershipGift;
			} )
			.catch( ( error ) => {
				dispatch(
					errorNotice( error.error.message ?? error.message, {
						duration: 10000,
					} )
				);
			} );
	};
};
