import { loadScript } from '@automattic/load-script';
import { useEffect } from 'react';
import { addHotJarScript } from 'calypso/lib/analytics/hotjar';
import MultiStepForm from './components/multi-step-form';
import SignupWrapper from './components/signup-wrapper';

const AgencySignupWCAsia = () => {
	useEffect( () => {
		// We need to include HubSpot tracking code on the signup form.
		loadScript( '//js.hs-scripts.com/45522507.js' );
		// Load Hotjar tracking script
		addHotJarScript();
	}, [] );

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
