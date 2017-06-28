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
import { createNotice, errorNotice } from 'state/notices/actions';
import { follow } from 'state/reader/follows/actions';
import { getFeedByFeedUrl } from 'state/reader/feeds/selectors';
import { getSiteByFeedUrl } from 'state/reader/sites/selectors';
import { getSiteName } from 'reader/get-helpers';

export function requestUnfollow( { dispatch, getState }, action ) {
	const { payload: { feedUrl } } = action;
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
		} ),
	);

	// build up a notice to show
	const site = getSiteByFeedUrl( getState(), feedUrl );
	const feed = getFeedByFeedUrl( getState(), feedUrl );
	const siteTitle = getSiteName( { feed, site } ) || feedUrl;
	dispatch(
		createNotice(
			null,
			translate( "You're no longer following %(siteTitle)s", { args: { siteTitle } } ),
			{
				duration: 5000,
			},
		),
	);
}

export function receiveUnfollow( store, action, next, response ) {
	if ( response && ! response.subscribed ) {
		next( action );
	} else {
		unfollowError( store, action, next );
	}
}

export function unfollowError( { dispatch, getState }, action, next ) {
	const feedUrl = action.payload.feedUrl;
	const site = getSiteByFeedUrl( getState(), feedUrl );
	const feed = getFeedByFeedUrl( getState(), feedUrl );
	const siteTitle = getSiteName( { feed, site } ) || feedUrl;
	dispatch(
		errorNotice(
			translate( 'Sorry, there was a problem unfollowing that %(siteTitle)s. Please try again.', {
				args: {
					siteTitle,
				},
			} ),
		),
	);
	next( follow( action.payload.feedUrl ) );
}

export default {
	[ READER_UNFOLLOW ]: [ dispatchRequest( requestUnfollow, receiveUnfollow, unfollowError ) ],
};
