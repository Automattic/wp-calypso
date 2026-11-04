import { isOnboardingFlow } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import {
	THEME_GRID_SIGNUP_LAYOUT,
	WOO_HOSTING_SOLUTIONS_REF,
} from 'calypso/landing/stepper/constants';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';

/**
 * Whether the account step uses the two-column layout with the brand panel. Left out:
 *   - Woo-referrer users (permanent treatment from PR #110118 — preserve their UX).
 *   - The theme grid layout, which has its own email-first layout.
 *   - Sub-960 px viewports — mobile-web signup is owned by a separate team.
 */
function useBrandedAccountLayout( flow: string ): boolean {
	const queryArgs = useQuery();
	const isWooReferrer = queryArgs.get( 'ref' ) === WOO_HOSTING_SOLUTIONS_REF;
	const isThemeGridLayout = queryArgs.get( 'signup_layout' ) === THEME_GRID_SIGNUP_LAYOUT;
	// `large` matches the 960 px breakpoint we use for the two-column layout.
	const isLargeViewport = useViewportMatch( 'large' );

	return isOnboardingFlow( flow ) && ! isWooReferrer && ! isThemeGridLayout && isLargeViewport;
}

export default useBrandedAccountLayout;
