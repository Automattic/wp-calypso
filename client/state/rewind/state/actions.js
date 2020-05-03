/**
 * Internal dependencies
 */
import { REWIND_STATE_REQUEST } from 'state/action-types';

import 'state/data-layer/wpcom/sites/rewind';

export const requestRewindState = ( siteId ) => ( {
	type: REWIND_STATE_REQUEST,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );
