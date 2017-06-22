/**
 * External dependencies
 */
import debugFactory from 'debug';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import {
	REWIND_RESTORE,
} from 'state/action-types';
import {
	rewindRestoreUpdateError,
	getRewindRestoreProgress,
} from 'state/activity-log/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

const debug = debugFactory( 'calypso:data-layer:activity-log:rewind:to' );

const requestRestore = ( { dispatch }, action ) => {
	dispatch( http( {
		method: 'POST',
		path: `/activity-log/${ action.siteId }/rewind/to/${ action.timestamp }`,
		apiVersion: '1',
	}, action ) );
};

export const receiveRestoreSuccess = ( { dispatch }, { siteId, timestamp } ) => {
	debug( 'Request restore success' );
	dispatch( getRewindRestoreProgress( siteId, timestamp ) );
};

export const receiveRestoreError = ( { dispatch }, { siteId, timestamp }, next, error ) => {
	debug( 'Request restore fail', error );
	dispatch( rewindRestoreUpdateError(
		siteId,
		timestamp,
		pick( error, [ 'error', 'status', 'message' ] )
	) );
};

export default {
	[ REWIND_RESTORE ]: [ dispatchRequest(
		requestRestore,
		receiveRestoreSuccess,
		receiveRestoreError
	) ],
};
