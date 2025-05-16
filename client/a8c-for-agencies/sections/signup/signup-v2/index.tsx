import { isEnabled } from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import { useEffect } from 'react';
import MultiStepForm from './components/multi-step-form';
import SignupWrapper from './components/signup-wrapper';

const AgencySignupV2 = () => {
	useEffect( () => {
		// We need to include HubSpot tracking code on the signup form.
		loadScript( '//js.hs-scripts.com/45522507.js' );
	}, [] );

	return (
		<SignupWrapper>
			<MultiStepForm signupWithMagicLinkFlow={ isEnabled( 'a4a-signup-v2-via-email' ) } />
		</SignupWrapper>
	);
};

export default AgencySignupV2;
