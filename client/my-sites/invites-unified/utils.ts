const ALREADY_MEMBER_ERRORS = [ 'already_member', 'already_subscribed' ];

/**
 * Check if an error string indicates the user is already a member
 */
export function isAlreadyMemberError( error: string ): boolean {
	return ALREADY_MEMBER_ERRORS.includes( error );
}

const INVALID_INVITE_ERRORS = [
	'unauthorized_created_by_self',
	'invalid_input_invite_used',
	'invalid_input_incorrect_site',
	'unknown_invite',
];

/**
 * Check if an error string indicates the invite is not valid
 */
export function isInvalidInviteError( error: string ): boolean {
	return INVALID_INVITE_ERRORS.includes( error );
}
