import { useViewportMatch } from '@wordpress/compose';
import { useExperiment } from 'calypso/lib/explat';

const EXPERIMENT_NAME = 'calypso_mobile_checkout_sticky_summary_v1';
const QUERY_PARAM = 'mobile_checkout_sticky_summary';

/**
 * The experiment only affects mobile viewports. The hook returns `false`
 * everywhere else — including the `?mobile_checkout_sticky_summary=1` debug
 * path — so callers never need to AND the result with a viewport check.
 * Preview on desktop by enabling devtools' mobile mode.
 */
export function useMobileCheckoutStickySummaryExperiment(): boolean {
	const isMobileViewport = useViewportMatch( 'small', '<' );
	const [ , assignment ] = useExperiment( EXPERIMENT_NAME, {
		isEligible: isMobileViewport,
	} );
	if ( ! isMobileViewport ) {
		return false;
	}
	if ( typeof window !== 'undefined' ) {
		const searchParams = new URLSearchParams( window.location.search );
		if ( searchParams.get( QUERY_PARAM ) === '1' ) {
			return true;
		}
	}
	return assignment?.variationName === 'treatment';
}
