import { isEnabled } from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { loadTrackingTool } from 'calypso/state/analytics/actions';
import MultiStepForm from './components/multi-step-form';
import SignupWrapper from './components/signup-wrapper';
import SignupLoader from './components/signup-wrapper/signup-loader';
import useAgencySessionCheck from './hooks/use-agency-session-check';

const AgencySignupV2 = () => {
	const dispatch = useDispatch();

	const isCheckingSession = useAgencySessionCheck();

	useEffect( () => {
		// We need to include HubSpot tracking code on the signup form.
		loadScript( '//js.hs-scripts.com/45522507.js' );
		// Load Hotjar tracking script
		dispatch( loadTrackingTool( 'HotJar' ) );
	}, [ dispatch ] );

	return (
		<SignupWrapper>
			{ isCheckingSession ? (
				<SignupLoader />
			) : (
				<MultiStepForm
					signupWithMagicLinkFlow={ isEnabled( 'a4a-signup-v2-via-email' ) }
					sourceName="Signup V2 Flow"
				/>
			) }
		</SignupWrapper>
	);
};

export default AgencySignupV2;
