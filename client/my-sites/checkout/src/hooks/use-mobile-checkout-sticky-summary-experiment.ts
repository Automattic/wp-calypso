import { useViewportMatch } from '@wordpress/compose';
import { useExperiment } from 'calypso/lib/explat';

const EXPERIMENT_NAME = 'calypso_mobile_checkout_sticky_summary_v1';
const QUERY_PARAM = 'mobile_checkout_sticky_summary';

export interface MobileCheckoutStickySummaryExperiment {
	isLoading: boolean;
	isMobileCheckoutStickySummary: boolean;
}

/**
 * Returns the current assignment for the mobile sticky checkout summary
 * experiment. `isLoading` is true while ExPlat is still resolving the
 * assignment — callers must suppress both treatment and control UI until
 * it resolves to avoid layout shift and metric self-bias.
 *
 * The experiment only affects mobile viewports. On desktop the hook
 * returns `{ isLoading: false, isMobileCheckoutStickySummary: false }`
 * immediately. The `?mobile_checkout_sticky_summary=1` query-param debug
 * shortcut only works on a mobile viewport — enable devtools' mobile
 * mode to preview on desktop.
 */
export function useMobileCheckoutStickySummaryExperiment(): MobileCheckoutStickySummaryExperiment {
	const isMobileViewport = useViewportMatch( 'small', '<' );
	const [ isLoading, assignment ] = useExperiment( EXPERIMENT_NAME, {
		isEligible: isMobileViewport,
	} );

	if ( ! isMobileViewport ) {
		return { isLoading: false, isMobileCheckoutStickySummary: false };
	}

	if ( isLoading ) {
		return { isLoading: true, isMobileCheckoutStickySummary: false };
	}

	if ( typeof window !== 'undefined' ) {
		const searchParams = new URLSearchParams( window.location.search );
		if ( searchParams.get( QUERY_PARAM ) === '1' ) {
			return { isLoading: false, isMobileCheckoutStickySummary: true };
		}
	}

	return {
		isLoading: false,
		isMobileCheckoutStickySummary: assignment?.variationName === 'treatment',
	};
}
