/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { REWIND_DEACTIVATE_REQUEST } from 'state/action-types';
import { rewindDeactivateFailure, rewindDeactivateSuccess } from 'state/activity-log/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';

const deactivateRewind = ( { dispatch }, action ) => {
	dispatch( http( {
		method: 'POST',
		path: `/activity-log/${ action.siteId }/rewind/deactivate`,
		apiVersion: '1',
	}, action ) );
};

export const deactivateSucceeded = ( { dispatch }, { siteId } ) => {
	dispatch( rewindDeactivateSuccess( siteId ) );
};

export const deactivateFailed = ( { dispatch }, { siteId }, { message } ) => {
	dispatch( errorNotice( translate(
		'Problem deactivating rewind: %(message)s',
		{ args: { message } }
	) ) );
	dispatch( rewindDeactivateFailure( siteId ) );
};

export default {
	[ REWIND_DEACTIVATE_REQUEST ]: [ dispatchRequest(
		deactivateRewind,
		deactivateSucceeded,
		deactivateFailed
	) ],
};
