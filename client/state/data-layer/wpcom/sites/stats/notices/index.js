import { UPDATE_STATS_NOTICE_STATUS_DIRECT } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const noop = () => {};

/**
 * Dismisses a jitm on the jetpack site.
 * The difference between this and doDismissJITM is that this action sends requests directly to the Jetpack site,
 * instead of going through the WordPress.com rest-api endpoint.
 *
 * @param {Object} action The dismissal action
 * @returns {Object} The HTTP fetch action
 */
export const doUpdateStatsNoticeStatusDirect = ( action ) =>
	http(
		{
			method: 'POST',
			path: '/stats/notices',
			body: {
				id: action.id,
				status: action.status,
				postponed_for: action.postponed_for,
			},
		},
		action
	);

registerHandlers( 'state/data-layer/wpcom/sites/stats/notices/index.js', {
	[ UPDATE_STATS_NOTICE_STATUS_DIRECT ]: [
		dispatchRequest( {
			fetch: doUpdateStatsNoticeStatusDirect,
			onSuccess: noop,
			onError: noop,
		} ),
	],
} );

export default {};
