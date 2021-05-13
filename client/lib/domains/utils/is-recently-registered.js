/**
 * External dependencies
 */
import moment from 'moment';

export function isRecentlyRegistered( registrationDate ) {
	return moment.utc( registrationDate ).isAfter( moment.utc().subtract( 30, 'minutes' ) );
}
