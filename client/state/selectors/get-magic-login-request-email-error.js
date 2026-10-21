import 'calypso/state/login/init';

export default function getMagicLoginRequestEmailError( state ) {
	return state?.login?.magicLogin?.requestEmailError ?? null;
}
