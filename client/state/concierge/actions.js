/** @format */

/**
 * Internal dependencies
 */
import { CONCIERGE_SLOTS_REQUEST, CONCIERGE_SLOTS_UPDATE } from 'state/action-types';

export const requestConciergeSlots = scheduleId => ( {
	type: CONCIERGE_SLOTS_REQUEST,
	scheduleId,
} );

export const updateConciergeSlots = slots => ( {
	type: CONCIERGE_SLOTS_UPDATE,
	slots,
} );
