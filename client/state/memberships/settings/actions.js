/**
 * Internal dependencies
 */
import { errorNotice, successNotice, warningNotice } from 'calypso/state/notices/actions';
import { MEMBERSHIPS_SETTINGS } from 'calypso/state/action-types';
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
		dispatch(
			warningNotice( noticeTextOnProcessing, {
				duration: 10000,
			} )
		);

		return wpcom.req
			.get( `/me/connected_account/stripe/${ connectedAccountId }/disconnect` )
			.then( () => {
				dispatch( requestSettings( siteId ) );
				dispatch(
					successNotice( noticeTextOnSuccess, {
						duration: 5000,
					} )
				);
			} )
			.catch( ( error ) => {
				dispatch(
					errorNotice( error.message, {
						duration: 10000,
					} )
				);
			} );
	};
};
