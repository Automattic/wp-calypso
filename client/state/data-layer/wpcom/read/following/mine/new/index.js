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
import { extendAction } from 'state/utils';
import { unfollow } from 'state/reader/follows/actions';
import { subscriptionFromApi } from 'state/data-layer/wpcom/read/following/mine';

export function requestFollow( { dispatch }, action, next ) {
	const { payload: { feedUrl } } = action;

	dispatch( http( {
		method: 'POST',
		path: '/read/following/mine/new',
		apiVersion: '1.1',
		body: {
			url: feedUrl,
			source: config( 'readerFollowingSource' )
		},
		onSuccess: action,
		onFailure: action,
	} ) );
	next( action );
}

export function receiveFollow( store, action, next, response ) {
	if ( response && response.subscribed ) {
		let actionToDispatch = action;
		if ( response.subscription ) {
			actionToDispatch = extendAction( action, {
				payload: {
					subscription: subscriptionFromApi( response.subscription )
				}
			} );
		}
		next( actionToDispatch );
	} else {
		next( unfollow( action.payload.feedUrl ) );
	}
}

export function followError( { dispatch }, action, next ) {
	dispatch(
		errorNotice(
			translate( 'Sorry, there was a problem following that site. Please try again.' )
		)
	);
	next( unfollow( action.payload.feedUrl ) );
}

export default {
	[ READER_FOLLOW ]: [ dispatchRequest( requestFollow, receiveFollow, followError ) ]
};
