import { useViewportMatch } from '@wordpress/compose';
import { useRef } from 'react';
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
 *
 * Eligibility is frozen at mount, mirroring
 * `useInitialIsInStepContainerV2FlowContext`. `useViewportMatch` is reactive, and
 * letting eligibility flip false -> true mid-session starts an ExPlat load, which
 * puts `isLoading` back to true, drives checkout's form status to LOADING and
 * unmounts the step group — taking anything the participant has typed with it.
 * Freezing also keeps a participant in one arm for the whole session.
 *
 * The freeze is per call site, so components that mount after a resize across the
 * breakpoint can disagree with ones already mounted. Hoisting this to a context
 * provided once by `CheckoutMain` would remove that; not worth the churn while
 * this is a short-lived experiment.
 *
 * Teardown: everything belonging to this experiment is named after it, in one of
 * three cases — `MobileCheckoutStickySummary` (identifiers),
 * `mobile-checkout-sticky-summary` (CSS classes and file names) and
 * `mobile_checkout_sticky_summary` (experiment name and query param). All three
 * fall out of `grep -rEi 'mobile[-_]?checkout[-_]?sticky[-_]?summary'`; keep it
 * that way when adding to the treatment.
 */
export function useMobileCheckoutStickySummaryExperiment(): MobileCheckoutStickySummaryExperiment {
	const isMobileViewport = useViewportMatch( 'small', '<' );
	const isStepContainerV2 = useInitialIsInStepContainerV2FlowContext();
	const isEligible = useRef( isMobileViewport && isStepContainerV2 ).current;
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
