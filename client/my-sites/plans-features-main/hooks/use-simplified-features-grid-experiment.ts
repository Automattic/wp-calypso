import config from '@automattic/calypso-config';
import {
	setSimplifiedFeaturesGridExperimentVariant as setExperimentVariant,
	SIMPLIFIED_FEATURES_GRID_EXPERIMENT_ID as EXPERIMENT_ID,
	SimplifiedFeaturesGridExperimentVariant as ExperimentVariant,
} from '@automattic/calypso-products';
import { useEffect } from 'react';
import { useExperiment } from 'calypso/lib/explat';

interface Params {
	flowName?: string | null;
	intent?: string;
	isInSignup: boolean;
}

function useSimplifiedFeaturesGridExperiment( { flowName, isInSignup, intent }: Params ): {
	isLoading: boolean;
	variant: ExperimentVariant;
} {
	const isEligibleSignupFlow = isInSignup && flowName === 'onboarding';
	const isEligibleAdminIntent = ! isInSignup && intent === 'plans-default-wpcom';
	const isEligible = isEligibleSignupFlow || isEligibleAdminIntent;
	const [ isLoading, assignment ] = useExperiment( EXPERIMENT_ID, { isEligible } );

	let variant = ( assignment?.variationName ?? 'control' ) as ExperimentVariant;

	if ( isEligible && config.isEnabled( 'simplified-features-grid-a' ) ) {
		variant = 'fix_inaccuracies';
	} else if ( isEligible && config.isEnabled( 'simplified-features-grid-b' ) ) {
		variant = 'simplified';
	}

	useEffect( () => setExperimentVariant( variant ), [ isLoading, variant ] );

	return { isLoading, variant };
}

export default useSimplifiedFeaturesGridExperiment;
