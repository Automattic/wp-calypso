import 'calypso/state/account/init';

export default function isAccountClosed( state ) {
	return state?.account?.isClosed ?? false;
}
