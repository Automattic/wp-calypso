import { ACTIVITY_LOG_DISPLAY_RULES_REQUEST } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/activity-log/get-display-rules';

const trackRequests = {
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
};

/**
 * Send an API request for information about a site's Activity Log display rules.
 *
 * @param	{number|null} siteId	Site ID
 * @returns	Action object
 */
export const requestDisplayRules = ( siteId: number | null ) =>
	( {
		type: ACTIVITY_LOG_DISPLAY_RULES_REQUEST,
		siteId,
		...trackRequests,
	} as const );
