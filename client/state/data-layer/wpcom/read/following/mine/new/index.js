/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import config from 'config';
import { READER_FOLLOW } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { successNotice, errorNotice } from 'state/notices/actions';
import { follow, unfollow, recordFollowError } from 'state/reader/follows/actions';
import { subscriptionFromApi } from 'state/data-layer/wpcom/read/following/mine';
import { getFeed } from 'state/reader/feeds/selectors';
import { getSite } from 'state/reader/sites/selectors';
import { getSiteName } from 'reader/get-helpers';

export function requestFollow( { dispatch }, action ) {
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
		} ),
	);
}

export function receiveFollow( store, action, next, response ) {
	if ( response && response.subscribed ) {
		const subscription = subscriptionFromApi( response.subscription );
		next( follow( action.payload.feedUrl, subscription ) );

		// build up a notice to show
		const site = getSite( store.getState(), subscription.blog_ID );
		const feed = getFeed( store.getState(), subscription.feed_ID );
		const siteTitle = getSiteName( { feed, site } ) || subscription.URL;
		store.dispatch(
			successNotice(
				translate( "You're now following %(siteTitle)s", { args: { siteTitle } } ),
				{ duration: 5000 },
			),
		);
	} else {
		followError( store, action, next, response );
	}
}

export function followError( { dispatch }, action, next, response ) {
	dispatch(
		errorNotice(
			translate( 'Sorry, there was a problem following that site. Please try again.' ),
		),
	);

	if ( response && response.info ) {
		dispatch( recordFollowError( action.payload.feedUrl, response.info ) );
	}

	next( unfollow( action.payload.feedUrl ) );
}

export default {
	[ READER_FOLLOW ]: [ dispatchRequest( requestFollow, receiveFollow, followError ) ],
};
