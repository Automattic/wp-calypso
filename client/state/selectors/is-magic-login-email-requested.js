import 'calypso/state/login/init';

export default function isMagicLoginEmailRequested( state ) {
	return state?.login?.magicLogin?.requestEmailSuccess ?? false;
}
