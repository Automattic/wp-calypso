/**
 * Internal dependencies
 */
import { REWIND_CAPABILITIES_REQUEST } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/rewind/capabilities';

export const requestRewindCapabilities = ( siteId ) => ( {
	type: REWIND_CAPABILITIES_REQUEST,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );
