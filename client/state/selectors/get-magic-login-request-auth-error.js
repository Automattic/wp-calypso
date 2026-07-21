import 'calypso/state/login/init';

export default function getMagicLoginRequestAuthError( state ) {
	return state?.login?.magicLogin?.requestAuthError ?? null;
}
