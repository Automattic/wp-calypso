const ALREADY_MEMBER_ERRORS = [ 'already_member', 'already_subscribed' ];

/**
 * Check if an error string indicates the user is already a member
 */
export function isAlreadyMemberError( error: string ): boolean {
	return ALREADY_MEMBER_ERRORS.includes( error );
}
