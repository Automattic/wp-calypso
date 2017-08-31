/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, removeNotice } from 'state/notices/actions';
import { fromApi } from './util';
import { updateFeed } from '../../feeds/actions';
import { getZone } from '../../zones/selectors';
import { ZONINATOR_REQUEST_FEED } from 'zoninator/state/action-types';

const requestFeedNotice = 'zoninator-request-feed';

export const requestZoneFeed = ( { dispatch }, action ) => {
	const { siteId, zoneId } = action;

	dispatch( removeNotice( requestFeedNotice ) );
	dispatch( http( {
		method: 'GET',
		path: `/jetpack-blogs/${ siteId }/rest-api/`,
		query: {
			path: `/zoninator/v1/zones/${ zoneId }`,
		},
	}, action ) );
};

export const requestZoneFeedError = ( { dispatch, getState }, { siteId, zoneId } ) => {
	const { name } = getZone( getState(), siteId, zoneId );

	dispatch( errorNotice(
		translate(
			'Could not fetch the posts feed for %(name)s. Please try again.',
			{ args: { name } },
		),
		{ id: requestFeedNotice },
	) );
};

export const updateZoneFeed = ( { dispatch }, { siteId, zoneId }, { data } ) =>
	dispatch( updateFeed( siteId, zoneId, fromApi( data ) ) );

const dispatchZoneFeedRequest = dispatchRequest( requestZoneFeed, updateZoneFeed, requestZoneFeedError );

export default {
	[ ZONINATOR_REQUEST_FEED ]: [ dispatchZoneFeedRequest ],
};
