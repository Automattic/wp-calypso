/**
 * Internal dependencies
 */
import { REWIND_CAPABILITIES_REQUEST } from 'state/action-types';

import 'state/data-layer/wpcom/sites/rewind/capabilities';

export const requestRewindCapabilities = ( siteId ) => ( {
	type: REWIND_CAPABILITIES_REQUEST,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );
