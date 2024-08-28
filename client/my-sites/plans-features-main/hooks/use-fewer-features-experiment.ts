import config from '@automattic/calypso-config';
import {
	setFewerFeaturesExperimentVariant,
	FewerFeaturesExperimentVariant,
	FEWER_FEATURES_EXPERIMENT_ID,
} from '@automattic/calypso-products';
import { useEffect } from 'react';
import { useExperiment } from 'calypso/lib/explat';

interface Params {
	flowName?: string | null;
	isInSignup: boolean;
	intent?: string;
}

function useFewerFeaturesExperiment( { flowName, isInSignup, intent }: Params ): {
	isLoadingFewerFeaturesExperiment: boolean;
	isAssignedToFewerFeaturesExperiment: boolean;
} {
	const [ isLoading, assignment ] = useExperiment( FEWER_FEATURES_EXPERIMENT_ID, {
		isEligible: flowName === 'onboarding' || ( ! isInSignup && intent === 'plans-default-wpcom' ),
	} );

	let variant = ( assignment?.variationName ?? 'control' ) as FewerFeaturesExperimentVariant;

	if ( config.isEnabled( 'plans/fewer-features-a' ) ) {
		variant = 'treatment-a';
	} else if ( config.isEnabled( 'plans/fewer-features-b' ) ) {
		variant = 'treatment-b';
	}

	useEffect( () => {
		setFewerFeaturesExperimentVariant( variant );
	}, [ isLoading, variant ] );

	return {
		isLoadingFewerFeaturesExperiment: isLoading,
		isAssignedToFewerFeaturesExperiment: variant !== 'control',
	};
}

export default useFewerFeaturesExperiment;
