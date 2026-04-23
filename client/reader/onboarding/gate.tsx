import { isEnabled } from '@automattic/calypso-config';
import AsyncLoad from 'calypso/components/async-load';

type ReaderOnboardingGateProps = {
	onRender?: ( shown: boolean ) => void;
	isSuppressed?: boolean;
};

export default function ReaderOnboardingGate( props: ReaderOnboardingGateProps ) {
	if ( isEnabled( 'reader/onboarding-rsm' ) ) {
		return <AsyncLoad require="calypso/reader/onboarding-rsm" { ...props } />;
	}

	return <AsyncLoad require="calypso/reader/onboarding" { ...props } />;
}
