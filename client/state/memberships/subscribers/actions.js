import wpcom from 'calypso/lib/wp';
import {
	MEMBERSHIPS_SUBSCRIBERS_LIST,
	MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS,
} from 'calypso/state/action-types';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

import 'calypso/state/data-layer/wpcom/sites/memberships';
import 'calypso/state/memberships/init';

export const requestSubscribers = ( siteId, offset ) => ( {
	siteId,
	type: MEMBERSHIPS_SUBSCRIBERS_LIST,
	offset,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );

export const requestSubscriptionStop = ( siteId, subscriber, noticeText ) => {
	return ( dispatch ) => {
		return wpcom.req
			.post( `/sites/${ siteId }/memberships/subscriptions/${ subscriber.id }/cancel`, {
				user_id: subscriber.user.ID,
			} )
			.then( ( result ) => {
				const errorMsg = result.error || '';

				if ( errorMsg.length > 0 ) {
					dispatch(
						errorNotice( errorMsg, {
							duration: 5000,
						} )
					);
				}

				dispatch( {
					siteId,
					type: MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS,
					subscriptionId: subscriber.id,
				} );

				dispatch( successNotice( noticeText ) );
			} )
			.catch( () => {} );
	};
};
