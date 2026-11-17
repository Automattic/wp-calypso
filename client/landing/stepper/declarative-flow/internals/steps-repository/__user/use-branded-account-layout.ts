import { isOnboardingFlow } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import {
	THEME_GRID_SIGNUP_LAYOUT,
	WOO_HOSTING_SOLUTIONS_REF,
} from 'calypso/landing/stepper/constants';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';

/**
 * Whether the account step uses the branded form, which gains the brand panel at 960 px. Left out:
 *   - Woo-referrer users (permanent treatment from PR #110118 — preserve their UX).
 *   - The theme grid layout, which has its own email-first layout.
 *   - Sub-600 px viewports: mobile-web signup is owned by a separate team.
 */
function useBrandedAccountLayout( flow: string ): boolean {
	const queryArgs = useQuery();
	const isWooReferrer = queryArgs.get( 'ref' ) === WOO_HOSTING_SOLUTIONS_REF;
	const isThemeGridLayout = queryArgs.get( 'signup_layout' ) === THEME_GRID_SIGNUP_LAYOUT;
	// The same check as the compact mobile layout, so exactly one of the two applies at every width.
	const isMobileViewport = useViewportMatch( 'small', '<' );

	return isOnboardingFlow( flow ) && ! isWooReferrer && ! isThemeGridLayout && ! isMobileViewport;
}

export default useBrandedAccountLayout;
