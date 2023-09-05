import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import { SchemaError } from 'calypso/lib/make-json-schema-parser';
import {
	REWIND_GRANULAR_RESTORE,
	REWIND_RESTORE,
	REWIND_CLONE,
	REWIND_STAGING_CLONE,
} from 'calypso/state/action-types';
import { getRewindRestoreProgress } from 'calypso/state/activity-log/actions';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { requestRewindState } from 'calypso/state/rewind/state/actions';

const fromApi = ( data ) => {
	const restoreId = parseInt( data.restore_id, 10 );

	if ( Number.isNaN( restoreId ) ) {
		throw new SchemaError( `missing numeric restore id - found '${ data.restore_id }'` );
	}

	return restoreId;
};

const requestRewind = ( action, payload ) =>
	http(
		{
			apiVersion: '1',
			method: 'POST',
			path: `/activity-log/${ action.siteId }/rewind/to/${ action.timestamp }`,
			body: Object.assign( payload, {
				calypso_env: config( 'env_id' ),
				force_rewind: true,
			} ),
		},
		action
	);

const requestRestore = ( action ) => requestRewind( action, { types: action.args } );

const requestGranularRestore = ( action ) =>
	requestRewind( action, {
		types: 'paths',
		include_path_list: action.includePaths,
		...( action.excludePaths ? { exclude_path_list: action.excludePaths } : {} ),
	} );

const requestClone = ( action ) => requestRewind( action, action.payload );

export const receiveRestoreSuccess = ( { siteId }, restoreId ) => [
	getRewindRestoreProgress( siteId, restoreId ),
	requestRewindState( siteId ),
];

export const receiveRestoreError = ( { siteId, timestamp }, error ) =>
	error.hasOwnProperty( 'schemaErrors' )
		? withAnalytics(
				recordTracksEvent( 'calypso_rewind_to_missing_restore_id', { site_id: siteId, timestamp } ),
				errorNotice(
					translate(
						"Oops, something went wrong. We've been notified and are working on resolving this issue."
					)
				)
		  )
		: withAnalytics(
				recordTracksEvent( 'calypso_rewind_to_unknown_error', error ),
				errorNotice(
					translate(
						'Oops, something went wrong. Please try again soon or contact support for help.'
					)
				)
		  );

const requestStagingClone = ( action ) =>
	http(
		{
			apiVersion: '1',
			method: 'POST',
			path: `/activity-log/${ action.sourceBlogId }/rewind/to/${ action.timestamp }/on/${ action.stagingBlogId }`,
			body: Object.assign( action.payload, {
				calypso_env: config( 'env_id' ),
				force_rewind: true,
			} ),
		},
		action
	);

export const receiveStagingCloneSuccess = ( { stagingBlogId }, restoreId ) => [
	getRewindRestoreProgress( stagingBlogId, restoreId ),
	requestRewindState( stagingBlogId ),
];

export const receiveStagingCloneError = ( { stagingBlogId, timestamp }, error ) =>
	error.hasOwnProperty( 'schemaErrors' )
		? withAnalytics(
				recordTracksEvent( 'calypso_rewind_to_missing_restore_id', {
					site_id: stagingBlogId,
					timestamp,
				} ),
				errorNotice(
					translate(
						"Oops, something went wrong. We've been notified and are working on resolving this issue."
					)
				)
		  )
		: withAnalytics(
				recordTracksEvent( 'calypso_rewind_to_unknown_error', error ),
				errorNotice(
					translate(
						'Oops, something went wrong. Please try again soon or contact support for help.'
					)
				)
		  );

registerHandlers( 'state/data-layer/wpcom/activity-log/rewind/to/index.js', {
	[ REWIND_RESTORE ]: [
		dispatchRequest( {
			fetch: requestRestore,
			onSuccess: receiveRestoreSuccess,
			onError: receiveRestoreError,
			fromApi,
		} ),
	],

	[ REWIND_CLONE ]: [
		dispatchRequest( {
			fetch: requestClone,
			onSuccess: receiveRestoreSuccess,
			onError: receiveRestoreError,
			fromApi,
		} ),
	],

	[ REWIND_STAGING_CLONE ]: [
		dispatchRequest( {
			fetch: requestStagingClone,
			onSuccess: receiveStagingCloneSuccess,
			onError: receiveStagingCloneError,
			fromApi,
		} ),
	],

	[ REWIND_GRANULAR_RESTORE ]: [
		dispatchRequest( {
			fetch: requestGranularRestore,
			onSuccess: receiveRestoreSuccess,
			onError: receiveRestoreError,
			fromApi,
		} ),
	],
} );
