/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { recordOnboardingStart } from '../lib/analytics';
import { USER_STORE } from '../stores/user';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { useIsAnchorFm } from '../path';

/**
 * Records an event in tracks on starting the onboarding flow, after trying to get the current user
 */

export default function useTrackOnboardingStart() {
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const { hasOnboardingStarted } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );
	const { startOnboarding } = useDispatch( ONBOARD_STORE );
	const isAnchorFmSignup = useIsAnchorFm();

	React.useEffect( () => {
		if ( ! hasOnboardingStarted && currentUser !== undefined ) {
			const ref = new URLSearchParams( window.location.search ).get( 'ref' ) || '';
			const siteCount = currentUser?.site_count ?? 0;
			recordOnboardingStart( ref, siteCount, isAnchorFmSignup );
			startOnboarding();
		}
	}, [ currentUser, hasOnboardingStarted, startOnboarding ] );
}
