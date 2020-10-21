/**
 * Internal dependencies
 */
import { REWIND_STATE_REQUEST } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/rewind';

export const requestRewindState = ( siteId ) => ( {
	type: REWIND_STATE_REQUEST,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );
