import wpcom from 'calypso/lib/wp';
import { MEMBERSHIPS_SETTINGS } from 'calypso/state/action-types';
import { errorNotice, successNotice, warningNotice } from 'calypso/state/notices/actions';

import 'calypso/state/data-layer/wpcom/sites/memberships';
import 'calypso/state/memberships/init';

export const requestSettings = ( siteId, source ) => ( {
	siteId,
	source,
	type: MEMBERSHIPS_SETTINGS,
} );

const requestDisconnectStripeAccountByUrl = (
	url,
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
			.get( `/sites/${ siteId }/connected_account/stripe/${ connectedAccountId }/disconnect` )
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

export const requestDisconnectSiteStripeAccount = (
	siteId,
	connectedAccountId,
	noticeTextOnProcessing,
	noticeTextOnSuccess
) => {
	return requestDisconnectStripeAccountByUrl(
		`/sites/${ siteId }/connected_account/stripe/${ connectedAccountId }/disconnect`,
		siteId,
		connectedAccountId,
		noticeTextOnProcessing,
		noticeTextOnSuccess
	);
};

export const requestDisconnectStripeAccount = (
	siteId,
	connectedAccountId,
	noticeTextOnProcessing,
	noticeTextOnSuccess
) => {
	return requestDisconnectStripeAccountByUrl(
		`/me/connected_account/stripe/${ connectedAccountId }/disconnect`,
		siteId,
		connectedAccountId,
		noticeTextOnProcessing,
		noticeTextOnSuccess
	);
};
