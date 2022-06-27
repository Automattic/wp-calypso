import moment from 'moment';

export function isRecentlyRegistered( registrationDate, minutes = 30 ) {
	return (
		registrationDate &&
		moment.utc( registrationDate ).isAfter( moment.utc().subtract( minutes, 'minutes' ) )
	);
}
