import { loadScript } from '@automattic/load-script';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { loadTrackingTool } from 'calypso/state/analytics/actions';
import MultiStepForm from './components/multi-step-form';
import SignupWrapper from './components/signup-wrapper';
import { WORDCAMP_SIGNUP_SOURCE } from './wordcamp-signup-campaign';

const AgencySignupWordCamp = () => {
	const dispatch = useDispatch();
	useEffect( () => {
		// We need to include HubSpot tracking code on the signup form.
		loadScript( '//js.hs-scripts.com/45522507.js' );
		// Load Hotjar tracking script
		dispatch( loadTrackingTool( 'HotJar' ) );
	}, [ dispatch ] );

	return (
		<SignupWrapper>
			<MultiStepForm signupWithMagicLinkFlow sourceName={ WORDCAMP_SIGNUP_SOURCE } />
		</SignupWrapper>
	);
};

export default AgencySignupWordCamp;
