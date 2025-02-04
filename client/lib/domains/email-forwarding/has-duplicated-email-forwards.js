/**
 * @param newEmailForward a string representing a new email forward
 * @returns { boolean } If the email forward is present in the existing email forwards collection
 */
export function hasDuplicatedEmailForwards( newEmailForward, existingEmailForwards ) {
	return existingEmailForwards?.some( ( forward ) => forward.mailbox === newEmailForward );
}
