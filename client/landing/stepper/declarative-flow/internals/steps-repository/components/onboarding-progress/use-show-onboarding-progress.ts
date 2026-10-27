import { useViewportMatch } from '@wordpress/compose';
import { getCurrentQueryParams } from 'calypso/landing/stepper/utils/get-current-query-params';

export function hasPurchaseStepsParameter( query: URLSearchParams ): boolean {
	return query.get( 'showPurchaseSteps' ) === 'true' && query.has( 'showDomainStep' );
}

/**
 * Single source of truth for whether the onboarding progress indicator shows.
 *
 * Desktop-only. Mobile keeps the existing top-bar step counter.
 */
export function useShowOnboardingProgress( isOnboardingFlow: boolean ): boolean {
	const isDesktop = useViewportMatch( 'large' );

	return ( isOnboardingFlow || hasPurchaseStepsParameter( getCurrentQueryParams() ) ) && isDesktop;
}
