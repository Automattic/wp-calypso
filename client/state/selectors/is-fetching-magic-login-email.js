import 'calypso/state/login/init';

export default function isFetchingMagicLoginEmail( state ) {
	return state?.login?.magicLogin?.isFetchingEmail ?? false;
}
