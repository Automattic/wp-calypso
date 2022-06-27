import moment from 'moment';

export function isRecentlyRegistered( registrationDate, minutes = 30 ) {
	return moment.utc( registrationDate ).isAfter( moment.utc().subtract( minutes, 'minutes' ) );
}
