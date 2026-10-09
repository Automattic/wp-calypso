import { useViewportMatch } from '@wordpress/compose';
import { getCurrentQueryParams } from 'calypso/landing/stepper/utils/get-current-query-params';

export function hasPurchaseStepsParameter( query: URLSearchParams ): boolean {
	return query.get( 'showPurchaseSteps' ) === 'true';
}

// Desktop uses the progress overview; mobile keeps the top-bar step counter.
export function useShowOnboardingProgress( isOnboardingFlow: boolean ): boolean {
	const isDesktop = useViewportMatch( 'large' );
	return ( isOnboardingFlow || hasPurchaseStepsParameter( getCurrentQueryParams() ) ) && isDesktop;
}
