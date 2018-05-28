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
import { dispatchRequestEx, getData } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';
import { transformApi } from 'state/data-layer/wpcom/sites/rewind/api-transformer';

const activateRewind = action => {
	const params = {
		method: 'POST',
		path: `/activity-log/${ action.siteId }/rewind/activate`,
		apiVersion: '1',
	};

	if ( action.isVpMigrate ) {
		params.body = { rewindOptIn: true };
	}

	return http( params, action );
};

export const activateSucceeded = action => {
	const successNotifier = rewindActivateSuccess( action.siteId );
	const rawData = getData( action );

	if ( undefined === get( rawData, 'rewind_state', undefined ) ) {
		return successNotifier;
	}

	return [
		successNotifier,
		{
			type: REWIND_STATE_UPDATE,
			siteId: action.siteId,
			data: transformApi( rawData.rewind_state ),
		},
	];
};

export const activateFailed = ( { siteId }, { message } ) => [
	errorNotice( translate( 'Problem activating rewind: %(message)s', { args: { message } } ) ),
	rewindActivateFailure( siteId ),
];

export default {
	[ REWIND_ACTIVATE_REQUEST ]: [
		dispatchRequestEx( {
			fetch: activateRewind,
			onSuccess: activateSucceeded,
			onError: activateFailed,
		} ),
	],
};
