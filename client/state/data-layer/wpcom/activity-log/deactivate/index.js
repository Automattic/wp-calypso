/** @format */

/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { REWIND_DEACTIVATE_REQUEST } from 'client/state/action-types';
import {
	rewindDeactivateFailure,
	rewindDeactivateSuccess,
} from 'client/state/activity-log/actions';
import { dispatchRequest } from 'client/state/data-layer/wpcom-http/utils';
import { http } from 'client/state/data-layer/wpcom-http/actions';
import { errorNotice } from 'client/state/notices/actions';

const deactivateRewind = ( { dispatch }, action ) => {
	dispatch(
		http(
			{
				method: 'POST',
				path: `/activity-log/${ action.siteId }/rewind/deactivate`,
				apiVersion: '1',
			},
			action
		)
	);
};

export const deactivateSucceeded = ( { dispatch }, { siteId } ) => {
	dispatch( rewindDeactivateSuccess( siteId ) );
};

export const deactivateFailed = ( { dispatch }, { siteId }, { message } ) => {
	dispatch(
		errorNotice( translate( 'Problem deactivating rewind: %(message)s', { args: { message } } ) )
	);
	dispatch( rewindDeactivateFailure( siteId ) );
};

export default {
	[ REWIND_DEACTIVATE_REQUEST ]: [
		dispatchRequest( deactivateRewind, deactivateSucceeded, deactivateFailed ),
	],
};
