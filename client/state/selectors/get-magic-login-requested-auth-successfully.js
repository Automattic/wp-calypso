import 'calypso/state/login/init';

export default function getMagicLoginRequestedAuthSuccessfully( state ) {
	return state?.login?.magicLogin?.requestAuthSuccess ?? false;
}
