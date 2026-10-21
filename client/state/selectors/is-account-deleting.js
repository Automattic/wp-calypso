import 'calypso/state/account/init';

export default function isAccountDeleting( state ) {
	return state?.account?.isDeleting ?? false;
}
