import { isEnabled } from '@automattic/calypso-config';
import AsyncLoad from 'calypso/components/async-load';

type ReaderOnboardingGateProps = {
	onRender?: ( shown: boolean ) => void;
	isSuppressed?: boolean;
};

export default function ReaderOnboardingGate( props: ReaderOnboardingGateProps ) {
	return (
		<AsyncLoad
			require={ () =>
				isEnabled( 'reader/onboarding-rsm' )
					? import(
							/** webpackChunkName: "async-load-calypso-reader-onboarding-rsm" */ 'calypso/reader/onboarding-rsm'
					  )
					: import(
							/** webpackChunkName: "async-load-calypso-reader-onboarding" */ 'calypso/reader/onboarding'
					  )
			}
			{ ...props }
		/>
	);
}
