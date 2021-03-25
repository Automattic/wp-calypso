export function canAddEmailToDomain( domain ) {
	if ( ! domain?.currentUserCanManage ) {
		return false;
	}

	if ( domain.isWPCOMDomain ) {
		return false;
	}

	return true;
}
