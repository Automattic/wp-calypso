/** @format */

/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { REWIND_ACTIVATE_REQUEST, REWIND_STATE_UPDATE } from 'state/action-types';
import { rewindActivateFailure, rewindActivateSuccess } from 'state/activity-log/actions';
import { dispatchRequest, getData } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';
import { transformApi } from 'state/data-layer/wpcom/sites/rewind/api-transformer';

const activateRewind = ( { dispatch }, action ) => {
	dispatch(
		http(
			{
				method: 'POST',
				path: `/activity-log/${ action.siteId }/rewind/activate`,
				apiVersion: '1',
			},
			action
		)
	);
};

export const activateSucceeded = ( { dispatch }, action ) => {
	dispatch( rewindActivateSuccess( action.siteId ) );
	const rawData = getData( action );
	if ( undefined !== get( rawData, 'rewind_state', undefined ) ) {
		dispatch( {
			type: REWIND_STATE_UPDATE,
			siteId: action.siteId,
			data: transformApi( rawData.rewind_state ),
		} );
	}
};

export const activateFailed = ( { dispatch }, { siteId }, { message } ) => {
	dispatch(
		errorNotice( translate( 'Problem activating rewind: %(message)s', { args: { message } } ) )
	);
	dispatch( rewindActivateFailure( siteId ) );
};

export default {
	[ REWIND_ACTIVATE_REQUEST ]: [
		dispatchRequest( activateRewind, activateSucceeded, activateFailed ),
	],
};
