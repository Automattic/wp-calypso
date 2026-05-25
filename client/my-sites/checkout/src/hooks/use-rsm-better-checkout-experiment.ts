import { useViewportMatch } from '@wordpress/compose';
import { useExperiment } from 'calypso/lib/explat';

const EXPERIMENT_NAME = 'calypso_rsm_better_checkout_v2';
const QUERY_PARAM = 'rsm_better_checkout';

export function useRsmBetterCheckoutExperiment(): boolean {
	// The treatment UI only renders on large viewports, so only enroll
	// large-viewport users to avoid diluting the treatment arm with users who
	// would see the control UI regardless of assignment.
	const isLargeViewport = useViewportMatch( 'large', '>=' );
	const [ , assignment ] = useExperiment( EXPERIMENT_NAME, {
		isEligible: isLargeViewport,
	} );
	const searchParams = new URLSearchParams( window.location.search );
	if ( searchParams.get( QUERY_PARAM ) === '1' ) {
		return true;
	}
	return assignment?.variationName === 'treatment';
}
