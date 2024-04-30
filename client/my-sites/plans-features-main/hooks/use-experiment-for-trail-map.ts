import config from '@automattic/calypso-config';
import { useExperiment } from 'calypso/lib/explat';
import type { DataResponse } from '@automattic/plans-grid-next';

interface Props {
	flowName?: string | null;
}

export enum TrailMapVariant {
	Control = 'control',
	TreatmentCopy = 'treatment-copy',
	TreatmentStructure = 'treatment-structure',
	TreatmentCopyAndStructure = 'treatment-copy-and-structure',
}

function useExperimentForTrailMap( { flowName }: Props ): DataResponse< TrailMapVariant > {
	const [ isLoading, experimentAssignment ] = useExperiment(
		'calypso_signup_onboarding_plans_trail_map_feature_grid',
		{
			isEligible: flowName === 'onboarding',
		}
	);

	let result = TrailMapVariant.Control;

	switch ( experimentAssignment?.variationName ) {
		case 'treatment_copy':
			result = TrailMapVariant.TreatmentCopy;
		case 'treatment_structure':
			result = TrailMapVariant.TreatmentStructure;
		case 'treatment_copy_and_structure':
			result = TrailMapVariant.TreatmentCopyAndStructure;
	}

	if ( config.isEnabled( 'onboarding/trail-map-feature-grid-copy' ) ) {
		result = TrailMapVariant.TreatmentCopy;
	} else if ( config.isEnabled( 'onboarding/trail-map-feature-grid-structure' ) ) {
		result = TrailMapVariant.TreatmentStructure;
	} else if ( config.isEnabled( 'onboarding/trail-map-feature-grid' ) ) {
		result = TrailMapVariant.TreatmentCopyAndStructure;
	}

	return {
		isLoading,
		result,
	};
}

export default useExperimentForTrailMap;
