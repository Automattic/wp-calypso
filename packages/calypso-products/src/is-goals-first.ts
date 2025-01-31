import { getPlansListExperiment } from './experiments';

export function isGoalsFirst(): boolean {
	return (
		getPlansListExperiment( 'calypso_signup_onboarding_goals_first_flow_holdout_20241220' ) ===
		'treatment_cumulative'
	);
}
