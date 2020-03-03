/**
 * Internal dependencies
 */

import {
	MEMBERSHIPS_SUBSCRIBERS_LIST,
	MEMBERSHIPS_SUBSCRIPTION_STOP,
	MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS,
	MEMBERSHIPS_SUBSCRIPTION_STOP_FAILURE,
	NOTICE_CREATE,
} from 'state/action-types';

import 'state/data-layer/wpcom/sites/memberships';
import wpcom from 'lib/wp';

export const requestSubscribers = ( siteId, offset ) => ( {
	siteId,
	type: MEMBERSHIPS_SUBSCRIBERS_LIST,
	offset,
} );

export const requestSubscriptionStop = ( siteId, subscription, noticeText ) => {
	return dispatch => {
		dispatch( {
			siteId,
			type: MEMBERSHIPS_SUBSCRIPTION_STOP,
			subscriptionId: subscription.id,
		} );

		return wpcom.req
			.post( `/sites/${ siteId }/memberships/subscriptions/${ subscription.id }/cancel`, {
				user_id: subscription.user.ID,
			} )
			.then( result => {
				const errorMsg = result.error || '';

				if ( errorMsg.length > 0 ) {
					dispatch( {
						type: MEMBERSHIPS_SUBSCRIPTION_STOP_FAILURE,
						subscriptionId: subscription.id,
						errorMsg,
					} );

					dispatch( {
						type: NOTICE_CREATE,
						notice: {
							duration: 5000,
							text: errorMsg,
							status: 'is-error',
						},
					} );
				}

				dispatch( {
					siteId,
					type: MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS,
					subscriptionId: subscription.id,
				} );

				dispatch( {
					type: NOTICE_CREATE,
					notice: {
						duration: 5000,
						text: noticeText,
						status: 'is-success',
					},
				} );
			} )
			.catch( error => {
				dispatch( {
					type: MEMBERSHIPS_SUBSCRIPTION_STOP_FAILURE,
					subscriptionId: subscription.id,
					error,
				} );
			} );
	};
};
