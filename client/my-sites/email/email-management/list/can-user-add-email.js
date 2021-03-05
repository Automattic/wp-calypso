/* TODO: find a good home for this */
export default function canUserAddEmail( domain ) {
	if ( ! domain?.currentUserCanManage ) {
		return false;
	}

	if ( domain.isWPCOMDomain ) {
		return false;
	}

	return true;
}
