/**
 * Internal dependencies
 */
import config from 'config';

export const WPCOM_CONCIERGE_SCHEDULE_ID = config( 'wpcom_concierge_schedule_id' ) || 1;

// booking status
export const CONCIERGE_STATUS_BOOKED = 'booked';
export const CONCIERGE_STATUS_BOOKING = 'booking';
export const CONCIERGE_STATUS_BOOKING_ERROR = 'booking_error';

// cancelling status
export const CONCIERGE_STATUS_CANCELLED = 'cancelled';
export const CONCIERGE_STATUS_CANCELLING = 'cancelling';
export const CONCIERGE_STATUS_CANCELLING_ERROR = 'cancelling_error';

// error codes
export const CONCIERGE_ERROR_NO_AVAILABLE_STAFF = 'rest_concierge_no_available_staff';
