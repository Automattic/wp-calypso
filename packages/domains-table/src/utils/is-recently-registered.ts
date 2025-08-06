import { isAfter, subMinutes } from 'date-fns';

export function isRecentlyRegistered( registrationDate: string, numberOfMinutes = 30 ) {
	return (
		registrationDate &&
		isAfter( new Date( registrationDate ), subMinutes( new Date(), numberOfMinutes ) )
	);
}
