import { isEnabled } from '@automattic/calypso-config';
import { dangerouslyGetExperimentAssignment } from 'calypso/lib/explat';

/**
 * Single on/off ExPlat experiment that gates the production domain-bundle
 * experience (search suggestion card + cart/checkout line-item grouping).
 * Treatment turns the experience on; control keeps the current no-bundle
 * behavior. The slug does not exist in ExPlat until it is created and approved,
 * so `loadExperimentAssignment` returns the control fallback until then.
 */
export const DOMAIN_BUNDLE_EXPERIMENT_NAME = 'calypso_domains_search_bundle_suggestions_202606';

/**
 * Variation name for the bundle-on arm. Matches the default split produced by
 * `explat-create-experiment` (control / treatment); centralized here so a rename
 * is a one-line change.
 */
export const DOMAIN_BUNDLE_EXPERIMENT_TREATMENT = 'treatment';

/**
 * Whether the domain-bundle experience should be enabled for this request.
 *
 * True when the dev/staging `domain-bundling` flag is on, OR when the user has
 * already been assigned the experiment treatment. This is a synchronous read of
 * an assignment that was made earlier at the search would-show decision point —
 * it deliberately uses `dangerouslyGetExperimentAssignment` so it does NOT
 * create a new exposure. Use it for the cart/checkout grouping surfaces that
 * must mirror the search arm without re-exposing the user.
 */
export function isDomainBundleExperienceEnabled(): boolean {
	if ( isEnabled( 'domain-bundling' ) ) {
		return true;
	}

	return (
		dangerouslyGetExperimentAssignment( DOMAIN_BUNDLE_EXPERIMENT_NAME )?.variationName ===
		DOMAIN_BUNDLE_EXPERIMENT_TREATMENT
	);
}
