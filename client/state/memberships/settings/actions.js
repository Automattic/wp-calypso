/**
 * Internal dependencies
 */
import { MEMBERSHIPS_SETTINGS, NOTICE_CREATE } from 'calypso/state/action-types';
import wpcom from 'calypso/lib/wp';

import 'calypso/state/data-layer/wpcom/sites/memberships';
import 'calypso/state/memberships/init';

export const requestSettings = ( siteId ) => ( {
	siteId,
	type: MEMBERSHIPS_SETTINGS,
} );

export const requestDisconnectStripeAccount = (
	siteId,
	connectedAccountId,
	noticeTextOnProcessing,
	noticeTextOnSuccess
) => {
	return ( dispatch ) => {
		dispatch( {
			type: NOTICE_CREATE,
			notice: {
				duration: 10000,
				text: noticeTextOnProcessing,
				status: 'is-warning',
			},
		} );

		return wpcom.req
			.get( `/me/connected_account/stripe/${ connectedAccountId }/disconnect` )
			.then( () => {
				dispatch( requestSettings( siteId ) );
				dispatch( {
					type: NOTICE_CREATE,
					notice: {
						duration: 5000,
						text: noticeTextOnSuccess,
						status: 'is-success',
					},
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: NOTICE_CREATE,
					notice: {
						duration: 10000,
						text: error.message,
						status: 'is-error',
					},
				} );
			} );
	};
};
