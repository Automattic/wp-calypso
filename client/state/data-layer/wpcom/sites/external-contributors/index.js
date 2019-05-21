/**
 * Internal dependencies
 */
import {
	EXTERNAL_CONTRIBUTORS_GET_REQUEST,
	EXTERNAL_CONTRIBUTORS_ADD_REQUEST,
	EXTERNAL_CONTRIBUTORS_REMOVE_REQUEST,
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	receiveGetExternalContributorsSuccess,
	receiveGetExternalContributorsFailure,
	receiveAddExternalContributorSuccess,
	receiveAddExternalContributorFailure,
	receiveRemoveExternalContributorSuccess,
	receiveRemoveExternalContributorFailure,
} from 'state/sites/external-contributors/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers( 'state/data-layer/wpcom/sites/external-contributors/index.js', {
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST ]: [
		dispatchRequest( {
			fetch: action =>
				http(
					{
						method: 'GET',
						path: `/sites/${ action.siteId }/external-contributors`,
						apiNamespace: 'wpcom/v2',
					},
					action
				),
			onSuccess: ( { siteId }, response ) =>
				receiveGetExternalContributorsSuccess( siteId, response ),
			onError: ( { siteId }, error ) => receiveGetExternalContributorsFailure( siteId, error ),
		} ),
	],
	[ EXTERNAL_CONTRIBUTORS_ADD_REQUEST ]: [
		dispatchRequest( {
			fetch: action =>
				http(
					{
						method: 'POST',
						path: `/sites/${ action.siteId }/external-contributors/add`,
						apiNamespace: 'wpcom/v2',
						body: {
							user_id: action.userId,
						},
					},
					action
				),
			onSuccess: ( { siteId, userId }, response ) =>
				receiveAddExternalContributorSuccess( siteId, userId, response ),
			onError: ( { siteId, userId }, error ) =>
				receiveAddExternalContributorFailure( siteId, userId, error ),
		} ),
	],
	[ EXTERNAL_CONTRIBUTORS_REMOVE_REQUEST ]: [
		dispatchRequest( {
			fetch: action =>
				http(
					{
						method: 'POST',
						path: `/sites/${ action.siteId }/external-contributors/remove`,
						apiNamespace: 'wpcom/v2',
						body: {
							user_id: action.userId,
						},
					},
					action
				),
			onSuccess: ( { siteId, userId }, response ) =>
				receiveRemoveExternalContributorSuccess( siteId, userId, response ),
			onError: ( { siteId, userId }, error ) =>
				receiveRemoveExternalContributorFailure( siteId, userId, error ),
		} ),
	],
} );
