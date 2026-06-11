import config from '@automattic/calypso-config';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import {
	getCurrentUser,
	getCurrentUserDisplayName,
	getCurrentUserEmail,
} from 'calypso/state/current-user/selectors';

type Nav2026Props =
	| {
			nav2026: true;
			nav2026Variant: 1 | 2;
			userAvatar?: string;
			userName?: string;
			userEmail?: string;
	  }
	| Record< string, never >;

// ExPlat experiment driving the 2026 Global Nav A/B test. It's a single
// `wpcom`-platform experiment (also serving the LOHP + Landpack PHP surfaces);
// the wpcom assignments controller allowlists it so the /assignments/calypso
// endpoint returns it here too, giving every surface consistent bucketing.
// Keep in sync with the PHP constant WPCOM_Global_Nav_Helpers::NAV_2026_EXPERIMENT.
const NAV_2026_EXPERIMENT = 'calypso_lossless_revert';

const VARIATION_TO_VARIANT: Record< string, 1 | 2 > = {
	treatment_1: 1,
	treatment_2: 2,
};

/**
 * Props to spread onto `UniversalNavbarHeader` to opt into the 2026 Global Nav.
 * Returns `{}` when the nav stays on the old design, so `{ ...useNav2026Props() }`
 * is a no-op then.
 *
 * Resolution order:
 * 1. `nav-redesign/2026` config flag — manual force-on for staff/dev. Variant
 *    follows the existing `nav-redesign/2026-variant-2` flag.
 * 2. The NAV_2026_EXPERIMENT assignment — `treatment_1`/`treatment_2` map to
 *    variants 1/2; everything else (control, null, still loading) → old nav.
 */
export function useNav2026Props(): Nav2026Props {
	const forcedOn = config.isEnabled( 'nav-redesign/2026' );
	const userAvatar = useSelector( ( state ) => getCurrentUser( state )?.avatar_URL );
	const userName = useSelector( getCurrentUserDisplayName );
	const userEmail = useSelector( getCurrentUserEmail );

	// SSR is ineligible (no assignment server-side); the browser refetches on hydration.
	const [ isLoadingExperiment, experimentAssignment ] = useExperiment( NAV_2026_EXPERIMENT, {
		isEligible: ! forcedOn && typeof window !== 'undefined',
	} );

	// Resolve the variant: the config flag forces it on for staff/dev, otherwise
	// the experiment assignment decides. Anything else (control, null, loading,
	// unknown variation) leaves it undefined → old nav.
	let variant: 1 | 2 | undefined;
	if ( forcedOn ) {
		variant = config.isEnabled( 'nav-redesign/2026-variant-2' ) ? 2 : 1;
	} else if ( ! isLoadingExperiment && experimentAssignment?.variationName ) {
		variant = VARIATION_TO_VARIANT[ experimentAssignment.variationName ];
	}

	if ( ! variant ) {
		return {};
	}

	return { nav2026: true, nav2026Variant: variant, userAvatar, userName, userEmail };
}
