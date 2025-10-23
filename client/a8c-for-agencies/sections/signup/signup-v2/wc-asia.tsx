import { loadScript } from '@automattic/load-script';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { loadTrackingTool } from 'calypso/state/analytics/actions';
import MultiStepForm from './components/multi-step-form';
import SignupWrapper from './components/signup-wrapper';

const AgencySignupWCAsia = () => {
	const dispatch = useDispatch();
	useEffect( () => {
		// We need to include HubSpot tracking code on the signup form.
		loadScript( '//js.hs-scripts.com/45522507.js' );
		// Load Hotjar tracking script
		dispatch( loadTrackingTool( 'HotJar' ) );
	}, [ dispatch ] );

	return (
		<SignupWrapper>
			<MultiStepForm
				signupWithMagicLinkFlow
				withPersonalizedBlueprint
				sourceName="WC Asia Signup Flow"
			/>
		</SignupWrapper>
	);
};

export default AgencySignupWCAsia;
