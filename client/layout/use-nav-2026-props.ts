import config from '@automattic/calypso-config';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import {
	getCurrentUser,
	getCurrentUserDisplayName,
	getCurrentUserEmail,
	isUserLoggedIn,
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
 * Returns a temporary loading class while a logged-in assignment is pending,
 * otherwise returns `{}` when the nav stays on the old design.
 *
 * Resolution order:
 * 1. Minimal universal headers are not eligible for Nav 2026.
 * 2. `nav-redesign/2026` config flag — manual force-on for staff/dev. Variant
 *    follows the existing `nav-redesign/2026-variant-2` flag.
 * 3. The NAV_2026_EXPERIMENT assignment — `showcase_products`/`showcase_products_and_ai`
 *    map to variants 1/2; everything else (control, null) → old nav.
 *    While the assignment is still loading for logged-in users, return a
 *    temporary className that hides the old nav until the assignment resolves.
 */
export function useNav2026Props( options: Nav2026Options = {} ): Nav2026Props {
	const isHeaderEligible = options.variant !== 'minimal';
	const forcedOn = isHeaderEligible && config.isEnabled( 'nav-redesign/2026' );
	const isLoggedIn = useSelector( isUserLoggedIn );
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

	if ( isLoggedIn && isLoadingExperiment && ! forcedOn ) {
		return { className: 'is-nav-2026-assignment-loading' };
	}

	if ( ! variant ) {
		return {};
	}

	return { nav2026: true, nav2026Variant: variant, userAvatar, userName, userEmail };
}
