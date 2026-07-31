import { isEnabled } from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { loadTrackingTool } from 'calypso/state/analytics/actions';
import {
	getActiveAgency,
	hasFetchedAgency,
	isFetchingAgency,
} from 'calypso/state/a8c-for-agencies/agency/selectors';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import useRedirectIfAgency from './hooks/use-redirect-if-agency';
import MultiStepForm from './components/multi-step-form';
import SignupWrapper from './components/signup-wrapper';
import SignupLoader from './components/signup-wrapper/signup-loader';

const AgencySignupV2 = () => {
	const dispatch = useDispatch();

	const userLoggedIn = useSelector( isUserLoggedIn );
	const currentAgency = useSelector( getActiveAgency );
	const hasFetched = useSelector( hasFetchedAgency );
	const isFetching = useSelector( isFetchingAgency );

	// Show the loader while we're still resolving the session state for logged-in users.
	// The `userLoggedIn &&` guard is required: agencies are never fetched for logged-out
	// visitors, so without it `hasFetched` stays false and they would get an infinite loader.
	const isCheckingSession = userLoggedIn && ( ! hasFetched || isFetching || !! currentAgency );

	useRedirectIfAgency();

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
