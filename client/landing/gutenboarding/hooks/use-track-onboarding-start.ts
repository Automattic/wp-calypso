/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { useLocale } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import { recordOnboardingStart } from '../lib/analytics';
import { USER_STORE } from '../stores/user';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { useOnboardingFlow } from '../path';

/**
 * Records an event in tracks on starting the onboarding flow, after trying to get the current user
 */

export default function useTrackOnboardingStart() {
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const { hasOnboardingStarted } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );
	const { startOnboarding } = useDispatch( ONBOARD_STORE );
	const flow = useOnboardingFlow();
	const locale = useLocale();

	React.useEffect( () => {
		if ( ! hasOnboardingStarted && currentUser !== undefined ) {
			const ref = new URLSearchParams( window.location.search ).get( 'ref' ) || '';
			const siteCount = currentUser?.site_count ?? 0;
			recordOnboardingStart( ref, siteCount, flow, locale );
			startOnboarding();
		}
	}, [ currentUser, hasOnboardingStarted, startOnboarding, flow, locale ] );
}
