/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { noop } from 'lodash';
import { registerHandlers } from 'state/data-layer/handler-registry';

import { MARKETING_CLICK_UPGRADE_NUDGE } from 'state/action-types';

export const notifyUpgradeNudgeClick = ( action ) =>
	http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/nudge/click`,
			apiNamespace: 'wpcom/v2',
			body: {
				nudge_name: action.nudgeName,
			},
		},
		action
	);

registerHandlers( 'state/data-layer/wpcom/marketing/index.js', {
	[ MARKETING_CLICK_UPGRADE_NUDGE ]: [
		dispatchRequest( {
			fetch: notifyUpgradeNudgeClick,
			onSuccess: noop,
			onError: noop,
		} ),
	],
} );
