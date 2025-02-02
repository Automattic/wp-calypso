import { getPlansListExperiment } from './experiments';

export function isBigSkyOnboarding(): boolean {
	return (
		getPlansListExperiment( 'calypso_signup_onboarding_goals_first_bigsky_202501_v1' ) ===
		'treatment'
	);
}
