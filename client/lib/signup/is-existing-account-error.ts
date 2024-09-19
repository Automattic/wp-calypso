export function isExistingAccountError( errorSlug: string ) {
	return [ 'already_taken', 'already_active', 'email_exists' ].includes( errorSlug );
}
