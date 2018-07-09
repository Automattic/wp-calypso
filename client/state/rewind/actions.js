/** @format */
/**
 * Internal dependencies
 */
import { REWIND_STATE_REQUEST } from 'state/action-types';
import { requireHandlers } from 'state/data-layer/handler-loading';
import { handlers } from 'state/data-layer/wpcom/sites/rewind';

requireHandlers( handlers );

export const requestRewindState = siteId => ( {
	type: REWIND_STATE_REQUEST,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );
