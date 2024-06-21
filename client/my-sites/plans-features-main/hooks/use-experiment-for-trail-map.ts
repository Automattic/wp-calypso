import config from '@automattic/calypso-config';
import {
	setTrailMapExperiment,
	TrailMapVariantType as VariantType,
} from '@automattic/calypso-products';
import { useEffect } from 'react';
import { useExperiment } from 'calypso/lib/explat';
import type { DataResponse } from '@automattic/plans-grid-next';

interface Params {
	flowName?: string | null;
	isInSignup: boolean;
	intent?: string;
}

function useExperimentForTrailMap( {
	flowName,
	isInSignup,
	intent,
}: Params ): DataResponse< boolean > {
	const [ isLoading, assignment ] = useExperiment(
		'calypso_signup_onboarding_plans_trail_map_feature_grid_v3',
		{
			isEligible: flowName === 'onboarding' || ( ! isInSignup && intent === 'plans-default-wpcom' ),
		}
	);

	let variant = ( assignment?.variationName ?? 'control' ) as VariantType;

	if ( config.isEnabled( 'onboarding/trail-map-feature-grid' ) ) {
		variant = 'treatment';
	}

	useEffect( () => {
		setTrailMapExperiment( variant );
	}, [ isLoading, variant ] );

	return {
		isLoading,
		result: variant === 'treatment',
	};
}

export default useExperimentForTrailMap;
