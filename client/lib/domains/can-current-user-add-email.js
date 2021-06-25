export function canCurrentUserAddEmail( domain ) {
	return !! domain?.currentUserCanAddEmail;
}
