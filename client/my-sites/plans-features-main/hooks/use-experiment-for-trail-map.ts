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
}

function useExperimentForTrailMap( { flowName }: Params ): {
	isTrailMapAny: boolean;
	isTrailMapCopy: boolean;
	isTrailMapStructure: boolean;
} {
	const [ isLoading, assignment ] = useExperiment(
		'calypso_signup_onboarding_plans_trail_map_feature_grid',
		{ isEligible: flowName === 'onboarding' }
	);

	let variant = ( assignment?.variationName ?? 'control' ) as VariantType;

	if ( config.isEnabled( 'onboarding/trail-map-feature-grid-copy' ) ) {
		variant = 'treatment-copy';
	} else if ( config.isEnabled( 'onboarding/trail-map-feature-grid-structure' ) ) {
		variant = 'treatment-structure';
	} else if ( config.isEnabled( 'onboarding/trail-map-feature-grid' ) ) {
		variant = 'treatment-copy-and-structure';
	}

	useEffect( () => {
		setTrailMapExperiment( variant ?? 'control' );
	}, [ isLoading, variant ] );

	return {
		isTrailMapAny: isTrailMapAnyVariant( variant ),
		isTrailMapCopy: isTrailMapCopyVariant( variant ),
		isTrailMapStructure: isTrailMapStructureVariant( variant ),
	};
}

export default useExperimentForTrailMap;
