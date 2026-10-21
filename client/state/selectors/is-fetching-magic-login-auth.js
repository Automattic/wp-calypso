import 'calypso/state/login/init';

export default function isFetchingMagicLoginAuth( state ) {
	return state?.login?.magicLogin?.isFetchingAuth ?? false;
}
