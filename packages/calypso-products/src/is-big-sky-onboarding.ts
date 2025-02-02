import { getPlansListExperiment } from './experiments';

declare global {
	interface Window {
		__a8cBigSkyOnboarding?: boolean;
	}
}

export function isBigSkyOnboarding(): boolean {
	if ( new URLSearchParams( location.search ).has( 'big-sky-checkout' ) ) {
		return true;
	}

	if (
		getPlansListExperiment( 'calypso_signup_onboarding_goals_first_bigsky_202501_v1' ) !==
		'treatment'
	) {
		return false;
	}

	if ( typeof window === 'undefined' ) {
		return false;
	}

	return Boolean( window.__a8cBigSkyOnboarding );
}
