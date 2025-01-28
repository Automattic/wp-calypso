const MAX_FORWARD_DESTINATIONS = 5;

/**
 * @param newEmailForward a string representing a new email forward
 * @param existingEmailForwards an array of strings representing existing email forwards
 * @returns { boolean } true if the email forward has more than the maximum number of destinations.
 */
export function hasTooManyEmailForwardsForMailbox( newEmailForward, existingEmailForwards ) {
	return (
		existingEmailForwards?.filter(
			( forward ) =>
				forward.mailbox.localeCompare( newEmailForward, undefined, { sensitivity: 'base' } ) === 0
		).length >= MAX_FORWARD_DESTINATIONS
	);
}
