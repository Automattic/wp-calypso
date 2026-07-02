import 'calypso/state/login/init';

export default function getMagicLoginRequestedEmailSuccessfully( state ) {
	return state?.login?.magicLogin?.requestedEmailSuccessfully ?? false;
}
