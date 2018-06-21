/** @format */
/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import config from 'config';
import { READER_UNFOLLOW } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';
import { follow } from 'state/reader/follows/actions';
import { getFeedByFeedUrl } from 'state/reader/feeds/selectors';
import { getSiteByFeedUrl } from 'state/reader/sites/selectors';
import { getSiteName } from 'reader/get-helpers';
import { bypassDataLayer } from 'state/data-layer/utils';

export function requestUnfollow( { dispatch }, action ) {
	const {
		payload: { feedUrl },
	} = action;
	dispatch(
		http( {
			method: 'POST',
			path: '/read/following/mine/delete',
			apiVersion: '1.1',
			body: {
				url: feedUrl,
				source: config( 'readerFollowingSource' ),
			},
			onSuccess: action,
			onFailure: action,
		} )
	);
}

export function receiveUnfollow( store, action, response ) {
	if ( response && ! response.subscribed ) {
		store.dispatch( bypassDataLayer( action ) );
	} else {
		unfollowError( store, action );
	}
}

export function unfollowError( { dispatch, getState }, action ) {
	const feedUrl = action.payload.feedUrl;
	const site = getSiteByFeedUrl( getState(), feedUrl );
	const feed = getFeedByFeedUrl( getState(), feedUrl );
	const siteTitle = getSiteName( { feed, site } ) || feedUrl;
	dispatch(
		errorNotice(
			translate( 'Sorry, there was a problem unfollowing %(siteTitle)s. Please try again.', {
				args: {
					siteTitle,
				},
			} ),
			{ duration: 5000 }
		)
	);
	dispatch( bypassDataLayer( follow( action.payload.feedUrl ) ) );
}

export default {
	[ READER_UNFOLLOW ]: [ dispatchRequest( requestUnfollow, receiveUnfollow, unfollowError ) ],
};
