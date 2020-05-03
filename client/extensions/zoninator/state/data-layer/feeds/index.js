/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';
import { initialize, startSubmit, stopSubmit } from 'redux-form';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';
import { fromApi, toApi } from './util';
import { updateFeed } from '../../feeds/actions';
import { resetLock } from '../../locks/actions';
import { getZone } from '../../zones/selectors';
import { ZONINATOR_REQUEST_FEED, ZONINATOR_SAVE_FEED } from 'zoninator/state/action-types';

const requestFeedNotice = 'zoninator-request-feed';
const saveFeedNotice = 'zoninator-save-feed';

export const requestZoneFeed = ( action ) => [
	removeNotice( requestFeedNotice ),
	http(
		{
			method: 'GET',
			path: `/jetpack-blogs/${ action.siteId }/rest-api/`,
			query: { path: `/zoninator/v1/zones/${ action.zoneId }/posts` },
		},
		action
	),
];

export const updateZoneFeed = ( action, response ) =>
	updateFeed( action.siteId, action.zoneId, fromApi( response.data, action.siteId ) );

export const requestZoneFeedError = ( action ) => ( dispatch, getState ) => {
	const { name } = getZone( getState(), action.siteId, action.zoneId );

	dispatch(
		errorNotice(
			translate( 'Could not fetch the posts feed for %(name)s. Please try again.', {
				args: { name },
			} ),
			{ id: requestFeedNotice }
		)
	);
};

export const saveZoneFeed = ( action ) => [
	startSubmit( action.form ),
	removeNotice( saveFeedNotice ),
	resetLock( action.siteId, action.zoneId ),
	http(
		{
			method: 'POST',
			path: `/jetpack-blogs/${ action.siteId }/rest-api/`,
			query: {
				body: JSON.stringify( toApi( action.posts ) ),
				json: true,
				path: `/zoninator/v1/zones/${ action.zoneId }/posts&_method=PUT`,
			},
		},
		action
	),
];

export const announceSuccess = ( { form, posts, siteId, zoneId } ) => [
	stopSubmit( form ),
	initialize( form, { posts } ),
	updateFeed( siteId, zoneId, posts ),
	successNotice( translate( 'Zone feed saved!' ), { id: saveFeedNotice } ),
];

export const announceFailure = ( action ) => [
	stopSubmit( action.form ),
	errorNotice( translate( 'There was a problem saving your changes. Please try again' ), {
		id: saveFeedNotice,
	} ),
];

const dispatchZoneFeedRequest = dispatchRequest( {
	fetch: requestZoneFeed,
	onSuccess: updateZoneFeed,
	onError: requestZoneFeedError,
} );

const dispatchSaveZoneFeedRequest = dispatchRequest( {
	fetch: saveZoneFeed,
	onSuccess: announceSuccess,
	onError: announceFailure,
} );

export default {
	[ ZONINATOR_REQUEST_FEED ]: [ dispatchZoneFeedRequest ],
	[ ZONINATOR_SAVE_FEED ]: [ dispatchSaveZoneFeedRequest ],
};
