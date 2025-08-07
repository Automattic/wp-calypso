import { isAfter, subMinutes } from 'date-fns';

/**
 * Compares a domain's registration date to the current timestamp to determine if a domain was
 * registered recently. Defaults to an arbitrary limit of 30 minutes.
 */
export function isRecentlyRegistered( registrationDate: string, numberOfMinutes = 30 ) {
	return (
		!! registrationDate &&
		isAfter( new Date( registrationDate ), subMinutes( new Date(), numberOfMinutes ) )
	);
}
