import { REWIND_POLICIES_REQUEST } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/rewind/policies';

const trackRequests = {
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
};

/**
 * Send an API request for information about a site's Rewind policies.
 * @param	{number|null} siteId	Site ID
 * @returns	Action object
 */
export const requestPolicies = ( siteId: number | null ) =>
	( {
		type: REWIND_POLICIES_REQUEST,
		siteId,
		...trackRequests,
	} ) as const;
