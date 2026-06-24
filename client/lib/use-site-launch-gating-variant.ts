/**
 * Site launch gating variant.
 *
 * The calypso_standardized_site_launch_gating_202603_v1 experiment concluded with
 * "semi_gated_site_launch" shipping as the default behavior for everyone. The
 * variant branches at the call sites of this hook are kept as scaffolding for the
 * expected follow-up experiment; they are unreachable while this hook returns a
 * hardcoded variant.
 *
 * To run the next experiment:
 * 1. Add any new variant name(s) to the SiteLaunchGatingVariant union.
 * 2. Replace the hardcoded return value below with a useExperiment() call for the
 *    new experiment name, e.g.:
 *
 *      const [ isLoading, experiment ] = useExperiment( 'new_experiment_name' );
 *      return [ isLoading, ( experiment?.variationName ?? null ) as SiteLaunchGatingVariant ];
 *
 * 3. Adjust the variant branches at the call sites of this hook as needed; `null`
 *    (control) should keep the default semi-gated behavior.
 */
export type SiteLaunchGatingVariant = 'semi_gated_site_launch' | null;

export function useSiteLaunchGatingVariant(): [ boolean, SiteLaunchGatingVariant ] {
	// [ isLoading, variant ]
	return [ false, 'semi_gated_site_launch' ];
}
