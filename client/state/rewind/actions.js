/** @format */
/**
 * Internal dependencies
 */
import { REWIND_STATE_REQUEST } from 'client/state/action-types';

export const requestRewindState = siteId => ( {
	type: REWIND_STATE_REQUEST,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );
