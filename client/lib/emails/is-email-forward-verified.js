export function isEmailForwardVerified( emailUser ) {
	return !! emailUser?.is_verified;
}
