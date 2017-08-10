/** @format */
/**
 * External dependencies
 */
import debugFactory from 'debug';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { REWIND_RESTORE } from 'state/action-types';
import { rewindRestoreUpdateError, getRewindRestoreProgress } from 'state/activity-log/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

const debug = debugFactory( 'calypso:data-layer:activity-log:rewind:to' );

const fromApi = data => ( {
	restoreId: +data.restore_id,
} );

const requestRestore = ( { dispatch }, action ) => {
	dispatch(
		http(
			{
				apiVersion: '1',
				method: 'POST',
				path: `/activity-log/${ action.siteId }/rewind/to/${ action.timestamp }`,
			},
			action
		)
	);
};

export const receiveRestoreSuccess = ( { dispatch }, { siteId, timestamp }, apiData ) => {
	const { restoreId } = fromApi( apiData );
	if ( restoreId ) {
		debug( 'Request restore success, restore id:', restoreId );
		dispatch( getRewindRestoreProgress( siteId, timestamp, restoreId ) );
	} else {
		debug( 'Request restore response missing restore_id' );
		dispatch(
			rewindRestoreUpdateError( siteId, timestamp, {
				status: 'finished',
				error: 'missing_restore_id',
				message: 'Bad response. No restore ID provided.',
			} )
		);
	}
};

export const receiveRestoreError = ( { dispatch }, { siteId, timestamp }, error ) => {
	debug( 'Request restore fail', error );
	dispatch(
		rewindRestoreUpdateError( siteId, timestamp, pick( error, [ 'error', 'status', 'message' ] ) )
	);
};

export default {
	[ REWIND_RESTORE ]: [
		dispatchRequest( requestRestore, receiveRestoreSuccess, receiveRestoreError ),
	],
};
