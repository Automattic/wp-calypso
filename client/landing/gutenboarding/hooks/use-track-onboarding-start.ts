import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { recordOnboardingStart } from '../lib/analytics';
import { useOnboardingFlow } from '../path';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { USER_STORE } from '../stores/user';

/**
 * Records an event in tracks on starting the onboarding flow, after trying to get the current user
 */

export default function useTrackOnboardingStart() {
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const { hasOnboardingStarted } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );
	const { startOnboarding } = useDispatch( ONBOARD_STORE );
	const flow = useOnboardingFlow();

	useEffect( () => {
		if ( ! hasOnboardingStarted && currentUser !== undefined ) {
			const ref = new URLSearchParams( window.location.search ).get( 'ref' ) || '';
			const siteCount = currentUser?.site_count ?? 0;
			recordOnboardingStart( ref, siteCount, flow );
			startOnboarding();
		}
	}, [ currentUser, hasOnboardingStarted, startOnboarding ] );
}
