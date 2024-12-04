import { useExperiment } from 'calypso/lib/explat';

export const useIsGoalsHoldout = ( step: string ) => {
	const [ , experimentAssignment ] = useExperiment( 'calypso_onboarding_goals_holdout_20241126', {
		// Hold off assigning user to group until it's absolutely necessary
		isEligible: [ 'goals', 'designSetup' ].includes( step ),
	} );

	return experimentAssignment?.variationName === 'holdout';
};
