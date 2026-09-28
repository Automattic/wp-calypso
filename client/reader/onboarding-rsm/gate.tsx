import AsyncLoad from 'calypso/components/async-load';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

const loadOnboarding = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-onboarding-rsm" */ 'calypso/reader/onboarding-rsm'
	);

type ReaderOnboardingGateProps = {
	onRender?: ( shown: boolean ) => void;
	isSuppressed?: boolean;
};

export default function ReaderOnboardingGate( props: ReaderOnboardingGateProps ) {
	const isLoggedIn = useSelector( isUserLoggedIn );

	// Reader onboarding is a logged-in-only experience (it reads/writes user
	// preferences and follow state). Surfaces like Discover render this gate
	// while logged out, so guard here rather than relying on the host route.
	if ( ! isLoggedIn ) {
		return null;
	}

	return <AsyncLoad require={ loadOnboarding } { ...props } placeholder={ null } />;
}
