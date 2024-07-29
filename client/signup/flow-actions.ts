import { loadExperimentAssignment } from 'calypso/lib/explat';

export const onEnterOnboarding = ( flowName: string ) => {
	// just to be extra safe since `loadExperimentAssignment` doesn't have the same eligibility check like `useExperiment` does
	if ( flowName === 'onboarding' ) {
		loadExperimentAssignment( 'calypso_signup_onboarding_deemphasize_free_plan' );
	}
};
