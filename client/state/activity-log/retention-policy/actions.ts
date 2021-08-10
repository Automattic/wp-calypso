/**
 * Internal dependencies
 */
import { ACTIVITY_LOG_DISPLAY_RULES_REQUEST } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/activity-log/get-retention-policy';

/**
 * Type dependencies
 */
import type { Action } from 'redux';

const trackRequests = {
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
};

type RequestActionType = Action< typeof ACTIVITY_LOG_DISPLAY_RULES_REQUEST > &
	typeof trackRequests & {
		siteId: number | null;
	};

/**
 * Send an API request for information about a site's Activity Log retention policy.
 *
 * @param	{number|null} siteId	Site ID
 * @returns	{RequestActionType}		Action object
 */
export const requestSiteRetentionPolicy = ( siteId: number | null ): RequestActionType =>
	( {
		type: ACTIVITY_LOG_DISPLAY_RULES_REQUEST,
		siteId,
		...trackRequests,
	} as const );
