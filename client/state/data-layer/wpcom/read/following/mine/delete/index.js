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

export function requestUnfollow( { dispatch }, action, next ) {
	const { payload: { url } } = action;
	dispatch( http( {
		method: 'POST',
		path: '/read/following/mine/delete',
		apiVersion: '1.1',
		query: {
			url, // should we support subId here?
			source: config( 'readerFollowingSource' )
		},
		onSuccess: action,
		onFailure: action,
	} ) );
	next( action );
}

export function receiveUnfollow( store, action, next, response ) {
	if ( ! ( response && response.subscribed ) ) {
		next( action );
	} else {
		next( follow( action.payload ) );
	}
}

export function unfollowError( { dispatch }, action, next ) {
	dispatch(
		errorNotice(
			translate( 'Sorry, there was a problem following that site. Please try again.' )
		)
	);
	next( follow( action.payload ) );
}

export default {
	[ READER_UNFOLLOW ]: [ dispatchRequest( requestUnfollow, receiveUnfollow, unfollowError ) ]
};
