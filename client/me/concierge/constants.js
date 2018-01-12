/**
 * Internal dependencies
 */
import config from 'config';

export const WPCOM_CONCIERGE_SCHEDULE_ID = config( 'wpcom_concierge_schedule_id' ) || 1;

// booking status
export const CONCIERGE_STATUS_BOOKED = 'booked';
export const CONCIERGE_STATUS_BOOKING = 'booking';
