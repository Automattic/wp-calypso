/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { REWIND_ACTIVATE_REQUEST, REWIND_STATE_UPDATE } from 'calypso/state/action-types';
import { rewindActivateFailure, rewindActivateSuccess } from 'calypso/state/activity-log/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { transformApi } from 'calypso/state/data-layer/wpcom/sites/rewind/api-transformer';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

const activateRewind = ( action ) =>
	http(
		{
			method: 'POST',
			path: `/activity-log/${ action.siteId }/rewind/activate`,
			apiVersion: '1',
			...( action.isVpMigrate ? { body: { rewindOptIn: true } } : {} ),
		},
		action
	);

export const activateSucceeded = ( action, rawData ) => {
	const successNotifier = rewindActivateSuccess( action.siteId );

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

registerHandlers( 'state/data-layer/wpcom/activity-log/activate/index.js', {
	[ REWIND_ACTIVATE_REQUEST ]: [
		dispatchRequest( {
			fetch: activateRewind,
			onSuccess: activateSucceeded,
			onError: activateFailed,
		} ),
	],
} );
