import { useViewportMatch } from '@wordpress/compose';
import { useInitialIsInStepContainerV2FlowContext } from 'calypso/layout/utils';
import { useExperiment } from 'calypso/lib/explat';

const EXPERIMENT_NAME = 'calypso_mobile_checkout_sticky_summary_v1';
const QUERY_PARAM = 'mobile_checkout_sticky_summary';

export interface MobileCheckoutStickySummaryExperiment {
	isLoading: boolean;
	isMobileCheckoutStickySummary: boolean;
}

/**
 * `isLoading` is load-bearing: checkout must not paint its steps until the
 * assignment resolves, or the treatment cohort is measured partly on control UI.
 * That gating lives in `checkoutLoadingConditions` in `checkout-main.tsx`
 * alongside checkout's other load blockers; consumers of
 * `isMobileCheckoutStickySummary` don't need to check `isLoading` themselves.
 *
 * Eligibility is gated to where the treatment can actually show — mobile inside a
 * StepContainerV2 flow. These components also render on `/me/purchases` (via
 * `useCreateCreditCard`), where enrolling would fire an exposure nobody can see.
 */
export function useMobileCheckoutStickySummaryExperiment(): MobileCheckoutStickySummaryExperiment {
	const isMobileViewport = useViewportMatch( 'small', '<' );
	const isStepContainerV2 = useInitialIsInStepContainerV2FlowContext();
	const isEligible = isMobileViewport && isStepContainerV2;
	const [ isLoading, assignment ] = useExperiment( EXPERIMENT_NAME, {
		isEligible,
	} );

	if ( ! isEligible ) {
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
