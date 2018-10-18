/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { STAGE_REQUEST } from 'state/action-types';

const stage = action =>
	http(
		{
			method: 'POST',
			path: '/sites/' + action.siteId + '/stage?force=wpcom',
		},
		action
	);

registerHandlers( 'state/data-layer/wpcom/sites/stage', {
	[ STAGE_REQUEST ]: [
		dispatchRequestEx( {
			fetch: stage,
			onSuccess: () => successNotice( translate( 'Creating a staging site.' ) ),
			onError: () => errorNotice( translate( 'Problem creating a staging site.' ) ),
		} ),
	],
} );

export default {};
