/**
 * Internal dependencies
 */
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { VIEWER_REMOVE, VIEWERS_REQUEST } from 'calypso/state/action-types';
import {
	removeViewerSuccess,
	requestViewersFailure,
	requestViewersSuccess,
} from 'calypso/state/viewers/actions';

const fetchViewers = ( action ) => {
	const { siteId, page, number } = action;
	const query = { page, number };

	return http(
		{
			method: 'GET',
			path: `/sites/${ siteId }/viewers`,
			apiVersion: '1.1',
			query,
		},
		action
	);
};

const fetchViewersSuccess = ( { siteId }, data ) => requestViewersSuccess( siteId, data );

const fetchViewersFailure = ( { siteId }, error ) => requestViewersFailure( siteId, error );

const requestRemoveViewer = ( action ) =>
	http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/viewers/${ action.viewerId }/delete`,
			apiVersion: '1.1',
		},
		action
	);

const requestRemoveViewerSuccess = ( { siteId, viewerId }, data ) =>
	removeViewerSuccess( siteId, viewerId, data );

registerHandlers( 'state/data-layer/wpcom/viewers/index.js', {
	[ VIEWERS_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchViewers,
			onSuccess: fetchViewersSuccess,
			onError: fetchViewersFailure,
		} ),
	],
	[ VIEWER_REMOVE ]: [
		dispatchRequest( {
			fetch: requestRemoveViewer,
			onSuccess: requestRemoveViewerSuccess,
		} ),
	],
} );
