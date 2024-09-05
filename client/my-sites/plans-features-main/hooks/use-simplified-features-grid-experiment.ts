import config from '@automattic/calypso-config';
import {
	SIMPLIFIED_FEATURES_GRID_EXPERIMENT_ID,
	SimplifiedFeaturesGridExperimentVariant,
	setSimplifiedFeaturesGridExperimentVariant,
} from '@automattic/calypso-products';
import { useEffect } from 'react';
import { useExperiment } from 'calypso/lib/explat';

interface Params {
	flowName?: string | null;
	isInSignup: boolean;
	intent?: string;
}

function useSimplifiedFeaturesGridExperiment( { flowName, isInSignup, intent }: Params ): {
	isLoading: boolean;
	variant: SimplifiedFeaturesGridExperimentVariant;
} {
	const [ isLoading, assignment ] = useExperiment( SIMPLIFIED_FEATURES_GRID_EXPERIMENT_ID, {
		isEligible: flowName === 'onboarding' || ( ! isInSignup && intent === 'plans-default-wpcom' ),
	} );

	let variant = ( assignment?.variationName ??
		'control' ) as SimplifiedFeaturesGridExperimentVariant;

	if ( config.isEnabled( 'simplified-features-grid-a' ) ) {
		variant = 'fix_inaccuracies';
	} else if ( config.isEnabled( 'simplified-features-grid-b' ) ) {
		variant = 'simplified';
	}

	useEffect( () => setSimplifiedFeaturesGridExperimentVariant( variant ), [ isLoading, variant ] );

	return {
		isLoading,
		variant,
	};
}

export default useSimplifiedFeaturesGridExperiment;
