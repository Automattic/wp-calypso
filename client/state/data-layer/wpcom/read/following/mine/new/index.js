/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import { getSiteName } from 'reader/get-helpers';
import { READER_FOLLOW } from 'state/action-types';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { subscriptionFromApi } from 'state/data-layer/wpcom/read/following/mine/utils';
import { successNotice, errorNotice } from 'state/notices/actions';
import { getFeedByFeedUrl } from 'state/reader/feeds/selectors';
import { follow, unfollow, recordFollowError } from 'state/reader/follows/actions';
import { getSiteByFeedUrl } from 'state/reader/sites/selectors';

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
