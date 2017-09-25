/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { REWIND_ACTIVATE_REQUEST } from 'state/action-types';
import { rewindActivateFailure, rewindActivateSuccess } from 'state/activity-log/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';

const activateRewind = ( { dispatch }, action ) => {
	dispatch( http( {
		method: 'POST',
		path: `/activity-log/${ action.siteId }/rewind/activate`,
		apiVersion: '1',
	}, action ) );
};

export const activateSucceeded = ( { dispatch }, { siteId } ) => {
	dispatch( rewindActivateSuccess( siteId ) );
};

export const activateFailed = ( { dispatch }, { siteId }, { message } ) => {
	dispatch( errorNotice( translate(
		'Problem activating rewind: %(message)s',
		{ args: { message } }
	) ) );
	dispatch( rewindActivateFailure( siteId ) );
};

export default {
	[ REWIND_ACTIVATE_REQUEST ]: [ dispatchRequest(
		activateRewind,
		activateSucceeded,
		activateFailed
	) ],
};
