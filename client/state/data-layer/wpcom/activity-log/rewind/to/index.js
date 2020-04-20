/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { getRewindRestoreProgress } from 'state/activity-log/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { requestRewindState } from 'state/rewind/state/actions';
import { REWIND_RESTORE, REWIND_CLONE } from 'state/action-types';
import { SchemaError } from 'lib/make-json-schema-parser';

import { registerHandlers } from 'state/data-layer/handler-registry';

const fromApi = ( data ) => {
	const restoreId = parseInt( data.restore_id, 10 );

	if ( Number.isNaN( restoreId ) ) {
		throw new SchemaError( 'missing numeric restore id - found `${ data.restore_id }`' );
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
			} ),
		},
		action
	);

const requestRestore = ( action ) => requestRewind( action, { types: action.args } );
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
} );
