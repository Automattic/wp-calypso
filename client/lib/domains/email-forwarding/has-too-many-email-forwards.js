const MAX_FORWARD_DESTINATIONS = 5;

/**
 * @param newEmailForward a string representing a new email forward
 * @returns { boolean } If the email forward is has more than the maximum number of destinations.
 */
export function hasTooManyEmailForwardsForMailbox( newEmailForward, existingEmailForwards ) {
	return (
		existingEmailForwards?.filter(
			( forward ) =>
				forward.mailbox.localeCompare( newEmailForward, undefined, { sensitivity: 'base' } ) === 0
		).length >= MAX_FORWARD_DESTINATIONS
	);
}
