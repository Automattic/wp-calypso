/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import config from '@automattic/calypso-config';
import { READER_FOLLOW } from 'calypso/state/reader/action-types';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { follow, unfollow, recordFollowError } from 'calypso/state/reader/follows/actions';
import { subscriptionFromApi } from 'calypso/state/data-layer/wpcom/read/following/mine/utils';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

export function requestFollow( action ) {
	const feedUrl = get( action, 'payload.feedUrl' );

	return http(
		{
			method: 'POST',
			path: '/read/following/mine/new',
			apiVersion: '1.1',
			body: {
				url: feedUrl,
				source: config( 'readerFollowingSource' ),
			},
		},
		action
	);
}

export function receiveFollow( action, response ) {
	if ( response && response.subscribed ) {
		const subscription = subscriptionFromApi( response.subscription );
		return bypassDataLayer( follow( action.payload.feedUrl, subscription ) );
	}
	return followError( action, response );
}

export function followError( action, response ) {
	const actions = [
		errorNotice(
			translate( 'Sorry, there was a problem following %(url)s. Please try again.', {
				args: { url: action.payload.feedUrl },
			} ),
			{ duration: 5000 }
		),
	];

	if ( response && response.info ) {
		actions.push( recordFollowError( action.payload.feedUrl, response.info ) );
	}

	actions.push( bypassDataLayer( unfollow( action.payload.feedUrl ) ) );

	return actions;
}

registerHandlers( 'state/data-layer/wpcom/read/following/mine/new/index.js', {
	[ READER_FOLLOW ]: [
		dispatchRequest( { fetch: requestFollow, onSuccess: receiveFollow, onError: followError } ),
	],
} );
