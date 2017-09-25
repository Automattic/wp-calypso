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
import { READER_UNFOLLOW } from 'state/action-types';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { createNotice, errorNotice } from 'state/notices/actions';
import { getFeedByFeedUrl } from 'state/reader/feeds/selectors';
import { follow } from 'state/reader/follows/actions';
import { getSiteByFeedUrl } from 'state/reader/sites/selectors';

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
		} )
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
			}
		)
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
			translate( 'Sorry, there was a problem unfollowing that %(siteTitle)s. Please try again.', {
				args: {
					siteTitle,
				},
			} )
		)
	);
	dispatch( bypassDataLayer( follow( action.payload.feedUrl ) ) );
}

export default {
	[ READER_UNFOLLOW ]: [ dispatchRequest( requestUnfollow, receiveUnfollow, unfollowError ) ],
};
