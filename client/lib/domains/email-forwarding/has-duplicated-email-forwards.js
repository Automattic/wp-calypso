/**
 * @param newEmailForward a string representing a new email forward
 * @returns { boolean } If the email forward is present in the existing email forwards collection
 */
export function isDuplicatedEmailForwards( newEmailForward, existingEmailForwards ) {
	return existingEmailForwards?.some( ( forward ) => forward.mailbox === newEmailForward );
}
