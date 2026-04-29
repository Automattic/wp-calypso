import { isEnabled } from '@automattic/calypso-config';
import AsyncLoad from 'calypso/components/async-load';

const loadOnboardingRsm = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-onboarding-rsm" */ 'calypso/reader/onboarding-rsm'
	);
const loadOnboarding = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-onboarding" */ 'calypso/reader/onboarding'
	);

type ReaderOnboardingGateProps = {
	onRender?: ( shown: boolean ) => void;
	isSuppressed?: boolean;
};

export default function ReaderOnboardingGate( props: ReaderOnboardingGateProps ) {
	return isEnabled( 'reader/onboarding-rsm' ) ? (
		<AsyncLoad require={ loadOnboardingRsm } { ...props } />
	) : (
		<AsyncLoad require={ loadOnboarding } { ...props } />
	);
}
