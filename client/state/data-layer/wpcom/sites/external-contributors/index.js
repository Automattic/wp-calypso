/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	EXTERNAL_CONTRIBUTORS_GET_REQUEST,
	EXTERNAL_CONTRIBUTORS_ADD_REQUEST,
	EXTERNAL_CONTRIBUTORS_REMOVE_REQUEST,
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';
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

const handleGetExternalContributorsFailure = ( { siteId }, error ) => {
	return [
		errorNotice(
			error.message
				? translate(
						'Failed to retrieve external contributor list for site %(siteId)d with message "%(message)s".',
						{ args: { message: error.message, siteId } }
				  )
				: translate( 'Failed to retrieve external contributor list for site %(siteId)d."', {
						args: { siteId },
				  } )
		),
		receiveGetExternalContributorsFailure( siteId, error ),
	];
};

const handleAddExternalContributorFailure = ( { siteId, userId }, error ) => {
	return [
		errorNotice(
			error.message
				? translate(
						'Failed to add external contributor %(userId)d for site %(siteId)d with message "%(message)s".',
						{ args: { message: error.message, siteId, userId } }
				  )
				: translate( 'Failed to add external contributor %(userId)d for site %(siteId)d."', {
						args: { siteId, userId },
				  } )
		),
		receiveAddExternalContributorFailure( siteId, error ),
	];
};

const handleRemoveExternalContributorFailure = ( { siteId, userId }, error ) => {
	return [
		errorNotice(
			error.message
				? translate(
						'Failed to remove external contributor %(userId)d for site %(siteId)d with message "%(message)s".',
						{ args: { message: error.message, siteId, userId } }
				  )
				: translate( 'Failed to remove external contributor %(userId)d for site %(siteId)d."', {
						args: { siteId, userId },
				  } )
		),
		receiveRemoveExternalContributorFailure( siteId, error ),
	];
};

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
			onError: handleGetExternalContributorsFailure,
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
			onError: handleAddExternalContributorFailure,
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
			onError: handleRemoveExternalContributorFailure,
		} ),
	],
} );
