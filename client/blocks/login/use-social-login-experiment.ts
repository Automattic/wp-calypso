import type { ExperimentAssignment } from '@automattic/explat-client';

const SOCIAL_LOGIN_EXPERIMENT = 'calypso_social_login_hide_apple_jetpack';

// Default to showing all buttons during SSR
const DEFAULT_EXPERIMENT_ASSIGNMENT: ExperimentAssignment = {
	experimentName: SOCIAL_LOGIN_EXPERIMENT,
	variationName: null,
	retrievedTimestamp: 0,
	ttl: 0,
};

type UseExperimentReturn = [ boolean, ExperimentAssignment ];

// Only load the real hook on the client side
let useSocialLoginExperiment = (): UseExperimentReturn => [ false, DEFAULT_EXPERIMENT_ASSIGNMENT ];

if ( typeof window !== 'undefined' ) {
	const { useExperiment } = require( 'calypso/lib/explat' );
	useSocialLoginExperiment = () => useExperiment( SOCIAL_LOGIN_EXPERIMENT );
}

export { useSocialLoginExperiment, SOCIAL_LOGIN_EXPERIMENT };
