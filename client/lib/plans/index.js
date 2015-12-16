/**
 * External dependencies
 */
import moment from 'moment';

export function getDaysUntilUserFacingExpiry( plan ) {
	const { userFacingExpiryMoment } = plan;

	return userFacingExpiryMoment.diff( moment(), 'days' );
};
