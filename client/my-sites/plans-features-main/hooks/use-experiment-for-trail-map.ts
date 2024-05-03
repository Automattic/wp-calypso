import config from '@automattic/calypso-config';
import { useExperiment } from 'calypso/lib/explat';
import type { DataResponse } from '@automattic/plans-grid-next';

interface Props {
	flowName?: string | null;
}

export const TrailMapVariant = {
	Control: 'control',
	TreatmentCopy: 'treatment-copy',
	TreatmentStructure: 'treatment-structure',
	TreatmentCopyAndStructure: 'treatment-copy-and-structure',
} as const;

export type VariantType = ( typeof TrailMapVariant )[ keyof typeof TrailMapVariant ];

function useExperimentForTrailMap( { flowName }: Props ): DataResponse< VariantType > {
	const [ isLoading, assignment ] = useExperiment(
		'calypso_signup_onboarding_plans_trail_map_feature_grid',
		{
			isEligible: flowName === 'onboarding',
		}
	);

	/**
	 * If a feature flag is enabled we don't care about the explat experiment
	 */
	if ( config.isEnabled( 'onboarding/trail-map-feature-grid-copy' ) ) {
		return { isLoading: false, result: TrailMapVariant.TreatmentCopy };
	} else if ( config.isEnabled( 'onboarding/trail-map-feature-grid-structure' ) ) {
		return { isLoading: false, result: TrailMapVariant.TreatmentStructure };
	} else if ( config.isEnabled( 'onboarding/trail-map-feature-grid' ) ) {
		return { isLoading: false, result: TrailMapVariant.TreatmentCopyAndStructure };
	}

	/**
	 * Currently assumes a 1:1 mapping between actual experiment variant name and logical enum name
	 * See: 21737-explat-experiment
	 */
	const result = ( assignment?.variationName ?? TrailMapVariant.Control ) as VariantType;
	return { isLoading, result };
}

export default useExperimentForTrailMap;
