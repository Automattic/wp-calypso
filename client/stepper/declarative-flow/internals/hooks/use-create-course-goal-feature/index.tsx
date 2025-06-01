import config from '@automattic/calypso-config';

export function useCreateCourseGoalFeature() {
	// Feature flag approach can be replaced with experiment later
	return config.isEnabled( 'onboarding/create-course' );
}
