/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { REWIND_RESTORE } from 'state/action-types';
import { getRewindRestoreProgress } from 'state/activity-log/actions';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { SchemaError, dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';
import { requestRewindState } from 'state/rewind/actions';

const fromApi = data => {
	const restoreId = parseInt( data.restore_id, 10 );

	if ( Number.isNaN( restoreId ) ) {
		throw new SchemaError( 'missing numeric restore id - found `${ data.restore_id }`' );
	}

	return restoreId;
};

const requestRestore = action =>
	http(
		{
			apiVersion: '1',
			method: 'POST',
			path: `/activity-log/${ action.siteId }/rewind/to/${ action.timestamp }`,
		},
		action
	);

export const receiveRestoreSuccess = ( { siteId, timestamp }, restoreId ) => [
	getRewindRestoreProgress( siteId, restoreId ),

	// once we start Rewinding we want to ensure that we
	// start tracking it and updating the "state machine"
	requestRewindState( siteId ),
];

export const receiveRestoreError = ( { siteId, timestamp }, error ) =>
	error.hasOwnProperty( 'schemaErrors' )
		? withAnalytics(
				recordTracksEvent( 'calypso_rewind_to_missing_restore_id', { siteId, timestamp } ),
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

export default {
	[ REWIND_RESTORE ]: [
		dispatchRequestEx( {
			fetch: requestRestore,
			onSuccess: receiveRestoreSuccess,
			onError: receiveRestoreError,
			fromApi,
		} ),
	],
};
