import moment from 'moment';

export function isRecentlyRegistered( registrationDate: string, numberOfMinutes = 30 ) {
	return (
		registrationDate &&
		moment.utc( registrationDate ).isAfter( moment.utc().subtract( numberOfMinutes, 'minutes' ) )
	);
}
