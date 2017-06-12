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
import { errorNotice } from 'state/notices/actions';
import { follow, unfollow, recordFollowError } from 'state/reader/follows/actions';
import { subscriptionFromApi } from 'state/data-layer/wpcom/read/following/mine';

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
		} )
	);
}

export function receiveFollow( store, action, next, response ) {
	if ( response && response.subscribed ) {
		next( follow( action.payload.feedUrl, subscriptionFromApi( response.subscription ) ) );
	} else {
		followError( store, action, next, response );
	}
}

export function followError( { dispatch }, action, next, response ) {
	dispatch(
		errorNotice( translate( 'Sorry, there was a problem following that site. Please try again.' ) )
	);

	if ( response && response.info ) {
		dispatch( recordFollowError( action.payload.feedUrl, response.info ) );
	}

	next( unfollow( action.payload.feedUrl ) );
}

export default {
	[ READER_FOLLOW ]: [ dispatchRequest( requestFollow, receiveFollow, followError ) ],
};
