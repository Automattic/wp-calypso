import config from '@automattic/calypso-config';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import {
	getCurrentUser,
	getCurrentUserDisplayName,
	getCurrentUserEmail,
} from 'calypso/state/current-user/selectors';
import type { HeaderProps } from '@automattic/wpcom-template-parts';

type Nav2026Props =
	| {
			className?: string;
			nav2026: true;
			nav2026Variant: 1 | 2;
			userAvatar?: string;
			userName?: string;
			userEmail?: string;
	  }
	| {
			className?: string;
			nav2026?: never;
			nav2026Variant?: never;
			userAvatar?: never;
			userName?: never;
			userEmail?: never;
	  };

type Nav2026Options = {
	variant?: HeaderProps[ 'variant' ];
};

// ExPlat experiment driving the 2026 Global Nav A/B test. It's a single
// `wpcom`-platform experiment (also serving the LOHP + Landpack PHP surfaces);
// the wpcom assignments controller allowlists it so the /assignments/calypso
// endpoint returns it here too, giving every surface consistent bucketing.
// Keep in sync with the PHP constant WPCOM_Global_Nav_Helpers::NAV_2026_EXPERIMENT.
const NAV_2026_EXPERIMENT = 'wpcom_global_navigation_202606';

const VARIATION_TO_VARIANT: Partial< Record< string, 1 | 2 > > = {
	showcase_products: 1,
	showcase_products_and_ai: 2,
};

/**
 * Props to spread onto `UniversalNavbarHeader` to opt into the 2026 Global Nav.
 * Returns a temporary loading class while the assignment is pending, otherwise
 * returns `{}` when the nav stays on the old design.
 *
 * Resolution order:
 * 1. Minimal universal headers are not eligible for Nav 2026.
 * 2. `nav-redesign/2026` config flag — manual force-on for staff/dev. Variant
 *    follows the existing `nav-redesign/2026-variant-2` flag.
 * 3. The NAV_2026_EXPERIMENT assignment — `showcase_products`/`showcase_products_and_ai`
 *    map to variants 1/2; everything else (control, null) → old nav.
 *    Until the variant is resolved — from the server render through the client
 *    loading window — return a temporary className that hides the nav, then reveal
 *    it once resolved. Hiding from SSR (not just after hydration) is what prevents
 *    the old-nav→new-nav flash.
 */
export function useNav2026Props( options: Nav2026Options = {} ): Nav2026Props {
	const isHeaderEligible = options.variant !== 'minimal';
	const forcedOn = isHeaderEligible && config.isEnabled( 'nav-redesign/2026' );
	const userAvatar = useSelector( ( state ) => getCurrentUser( state )?.avatar_URL );
	const userName = useSelector( getCurrentUserDisplayName );
	const userEmail = useSelector( getCurrentUserEmail );

	// SSR is ineligible (no assignment server-side); the browser refetches on hydration.
	const [ isLoadingExperiment, experimentAssignment ] = useExperiment( NAV_2026_EXPERIMENT, {
		isEligible: isHeaderEligible && ! forcedOn && typeof window !== 'undefined',
	} );

	// Resolve the variant: the config flag forces it on for staff/dev, otherwise
	// the experiment assignment decides. Anything else (control, null, unknown
	// variation) leaves it undefined → old nav.
	let variant: 1 | 2 | undefined;
	if ( forcedOn ) {
		variant = config.isEnabled( 'nav-redesign/2026-variant-2' ) ? 2 : 1;
	} else if ( ! isLoadingExperiment && experimentAssignment?.variationName ) {
		variant = VARIATION_TO_VARIANT[ experimentAssignment.variationName ];
	}

	// Hide the nav until the variant is resolved, then reveal it. The assignment is
	// only available client-side, so we hide from the server render onwards (SSR:
	// `window` is undefined; client: until the experiment finishes loading) and let
	// the client reveal the resolved nav once known. Hiding from SSR — rather than
	// only after hydration — is what actually prevents the old-nav→new-nav flash, and
	// keeps the server and first client render in sync (no hydration mismatch).
	//
	// The nav markup and its links stay in the DOM; only `visibility` is toggled. A
	// no-JS client (including crawlers) never runs the reveal, so it keeps the nav
	// hidden — an accepted trade-off, pending SEO sign-off.
	const isVariantResolved = forcedOn || ( typeof window !== 'undefined' && ! isLoadingExperiment );
	if ( isHeaderEligible && ! forcedOn && ! isVariantResolved ) {
		return { className: 'is-nav-2026-assignment-loading' };
	}

	if ( ! variant ) {
		return {};
	}

	return { nav2026: true, nav2026Variant: variant, userAvatar, userName, userEmail };
}
