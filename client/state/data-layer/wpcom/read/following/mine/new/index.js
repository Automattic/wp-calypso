import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import { removeRecommendedSiteFromCache } from 'calypso/reader/data/recommended-sites';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { subscriptionFromApi } from 'calypso/state/data-layer/wpcom/read/following/mine/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import { READER_FOLLOW } from 'calypso/state/reader/action-types';
import {
	follow,
	unfollow,
	recordFollowError,
	requestFollowCompleted,
} from 'calypso/state/reader/follows/actions';

export function requestFollow( action ) {
	const feedUrl = action.payload?.feedUrl;

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

function getRecommendedSiteFollowSuccessActions( recommendedSiteInfo ) {
	if ( ! recommendedSiteInfo ) {
		return [];
	}

	const { siteId, seed, siteTitle } = recommendedSiteInfo;

	if ( typeof seed === 'number' && typeof siteId === 'number' ) {
		removeRecommendedSiteFromCache( getCalypsoQueryClient(), { seed, siteId } );
	}

	return [
		successNotice( translate( "Success! You're now subscribed to %s.", { args: siteTitle } ), {
			duration: 5000,
		} ),
	];
}

export function receiveFollow( action, response ) {
	if ( response && response.subscribed ) {
		const subscription = subscriptionFromApi( response.subscription );
		const recommendedSiteInfo = action.payload?.recommendedSiteInfo;
		const actions = [
			bypassDataLayer( follow( action.payload.feedUrl, subscription ) ),
			requestFollowCompleted( action?.payload?.feedUrl ),
		];

		if ( recommendedSiteInfo ) {
			actions.push( ...getRecommendedSiteFollowSuccessActions( recommendedSiteInfo ) );
		}

		return actions;
	}
	return followError( action, response );
}

export function followError( action, response ) {
	const actions = [
		errorNotice(
			translate( 'Sorry, there was a problem subscribing %(url)s. Please try again.', {
				args: { url: action.payload.feedUrl },
			} ),
			{ duration: 5000 }
		),
		requestFollowCompleted( action?.payload?.feedUrl ),
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
