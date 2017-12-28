/** @format */
/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import config from 'config';
import { READER_FOLLOW } from 'client/state/action-types';
import { dispatchRequest } from 'client/state/data-layer/wpcom-http/utils';
import { http } from 'client/state/data-layer/wpcom-http/actions';
import { successNotice, errorNotice } from 'client/state/notices/actions';
import { follow, unfollow, recordFollowError } from 'client/state/reader/follows/actions';
import { subscriptionFromApi } from 'client/state/data-layer/wpcom/read/following/mine/utils';
import { getFeedByFeedUrl } from 'client/state/reader/feeds/selectors';
import { getSiteByFeedUrl } from 'client/state/reader/sites/selectors';
import { getSiteName } from 'client/reader/get-helpers';
import { bypassDataLayer } from 'client/state/data-layer/utils';

export function requestFollow( { dispatch, getState }, action ) {
	const { payload: { feedUrl } } = action;

	dispatch(
		http( {
			method: 'POST',
			path: '/read/following/mine/new',
			apiVersion: '1.1',
			body: {
				url: feedUrl,
				source: config( 'readerFollowingSource' ),
			},
			onSuccess: action,
			onFailure: action,
		} )
	);

	// build up a notice to show
	const site = getSiteByFeedUrl( getState(), feedUrl );
	const feed = getFeedByFeedUrl( getState(), feedUrl );
	const siteTitle = getSiteName( { feed, site } ) || feedUrl;
	dispatch(
		successNotice( translate( "You're now following %(siteTitle)s", { args: { siteTitle } } ), {
			duration: 5000,
		} )
	);
}

export function receiveFollow( store, action, response ) {
	if ( response && response.subscribed ) {
		const subscription = subscriptionFromApi( response.subscription );
		store.dispatch( bypassDataLayer( follow( action.payload.feedUrl, subscription ) ) );
	} else {
		followError( store, action, response );
	}
}

export function followError( { dispatch }, action, response ) {
	dispatch(
		errorNotice(
			translate( 'Sorry, there was a problem following %(url)s. Please try again.', {
				args: { url: action.payload.feedUrl },
			} ),
			{ duration: 5000 }
		)
	);

	if ( response && response.info ) {
		dispatch( recordFollowError( action.payload.feedUrl, response.info ) );
	}

	dispatch( bypassDataLayer( unfollow( action.payload.feedUrl ) ) );
}

export default {
	[ READER_FOLLOW ]: [ dispatchRequest( requestFollow, receiveFollow, followError ) ],
};
