import 'calypso/state/login/init';

export default function getMagicLoginCurrentView( state ) {
	return state?.login?.magicLogin?.currentView ?? null;
}
