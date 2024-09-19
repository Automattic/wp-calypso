import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import { getSiteName } from 'calypso/reader/get-helpers';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { READER_UNFOLLOW } from 'calypso/state/reader/action-types';
import { getFeedByFeedUrl } from 'calypso/state/reader/feeds/selectors';
import { follow } from 'calypso/state/reader/follows/actions';
import { getSiteByFeedUrl } from 'calypso/state/reader/sites/selectors';

export const requestUnfollow = ( action ) =>
	http( {
		method: 'POST',
		path: '/read/following/mine/delete',
		apiVersion: '1.1',
		body: {
			url: action.payload.feedUrl,
			source: config( 'readerFollowingSource' ),
		},
		onSuccess: action,
		onFailure: action,
	} );

export const fromApi = ( data ) => {
	if ( ! data ) {
		throw new Error( 'Invalid API response: missing data' );
	}

	if ( data.subscribed ) {
		throw new Error( 'Did not unfollow' );
	}

	return data.subscribed;
};

export const receiveUnfollow = ( action ) => bypassDataLayer( action );

export const unfollowError = ( action ) => ( dispatch, getState ) => {
	const feedUrl = action.payload.feedUrl;
	const site = getSiteByFeedUrl( getState(), feedUrl );
	const feed = getFeedByFeedUrl( getState(), feedUrl );
	const siteTitle = getSiteName( { feed, site } ) || feedUrl;

	dispatch(
		errorNotice(
			translate( 'Sorry, there was a problem unsubscribing %(siteTitle)s. Please try again.', {
				args: {
					siteTitle,
				},
			} ),
			{ duration: 5000 }
		)
	);

	dispatch( bypassDataLayer( follow( action.payload.feedUrl ) ) );
};

registerHandlers( 'state/data-layer/wpcom/read/following/mine/delete/index.js', {
	[ READER_UNFOLLOW ]: [
		dispatchRequest( {
			fetch: requestUnfollow,
			onSuccess: receiveUnfollow,
			onError: unfollowError,
			fromApi,
		} ),
	],
} );
