import config from '@automattic/calypso-config';
import {
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
	isTrailMap: boolean;
} {
	const [ isLoading, assignment ] = useExperiment(
		'calypso_signup_onboarding_plans_trail_map_feature_grid_v3',
		{
			isEligible: flowName === 'onboarding' || ( ! isInSignup && intent === 'plans-default-wpcom' ),
		}
	);

	let variant = (
		assignment?.variationName === 'treatment' ? 'treatment_copy_and_structure' : 'control'
	) as VariantType;

	if ( config.isEnabled( 'onboarding/trail-map-feature-grid' ) ) {
		variant = 'treatment';
	}

	useEffect( () => {
		setTrailMapExperiment( variant ?? 'control' );
	}, [ isLoading, variant ] );

	return {
		isLoading,
		isTrailMap: variant === 'treatment',
	};
}

export default useExperimentForTrailMap;
