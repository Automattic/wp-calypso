import config from '@automattic/calypso-config';
import {
	isTrailMapAnyVariant,
	isTrailMapCopyVariant,
	isTrailMapStructureVariant,
	setTrailMapExperiment,
	TrailMapVariantType as VariantType,
} from '@automattic/calypso-products';
import { useEffect } from 'react';
import { useExperiment } from 'calypso/lib/explat';

interface Params {
	flowName?: string | null;
	isInSignup: boolean;
	intent?: string;
}

function useExperimentForTrailMap( { flowName, isInSignup, intent }: Params ): {
	isLoading: boolean;
	variant: VariantType;
	isTrailMapAny: boolean;
	isTrailMapCopy: boolean;
	isTrailMapStructure: boolean;
} {
	const [ isLoading, assignment ] = useExperiment(
		'calypso_signup_onboarding_plans_trail_map_feature_grid_v2',
		{
			isEligible: flowName === 'onboarding' || ( ! isInSignup && intent === 'plans-default-wpcom' ),
		}
	);

	let variant = ( assignment?.variationName ?? 'control' ) as VariantType;

	if ( config.isEnabled( 'onboarding/trail-map-feature-grid-copy' ) ) {
		variant = 'treatment_copy';
	} else if ( config.isEnabled( 'onboarding/trail-map-feature-grid-structure' ) ) {
		variant = 'treatment_structure';
	} else if ( config.isEnabled( 'onboarding/trail-map-feature-grid' ) ) {
		variant = 'treatment_copy_and_structure';
	}

	useEffect( () => {
		setTrailMapExperiment( variant ?? 'control' );
	}, [ isLoading, variant ] );

	return {
		isLoading,
		variant,
		isTrailMapAny: isTrailMapAnyVariant( variant ),
		isTrailMapCopy: isTrailMapCopyVariant( variant ),
		isTrailMapStructure: isTrailMapStructureVariant( variant ),
	};
}

export default useExperimentForTrailMap;
