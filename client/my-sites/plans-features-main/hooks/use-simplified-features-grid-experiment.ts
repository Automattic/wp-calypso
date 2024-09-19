import config from '@automattic/calypso-config';
import {
	setSimplifiedFeaturesGridExperimentVariant as setExperimentVariant,
	SIMPLIFIED_FEATURES_GRID_EXPERIMENT_ID as EXPERIMENT_ID,
	SimplifiedFeaturesGridExperimentVariant as ExperimentVariant,
} from '@automattic/calypso-products';
import { useEffect, useState } from 'react';
import { useExperiment } from 'calypso/lib/explat';

interface Params {
	flowName?: string | null;
	intent?: string;
	isInSignup: boolean;
}

function useSimplifiedFeaturesGridExperiment( { flowName, isInSignup, intent }: Params ): {
	isLoading: boolean;
	isTargetedView: boolean;
	variant: ExperimentVariant;
	setVariantOverride: ( variant: ExperimentVariant | null ) => void;
} {
	const isTargetedSignupFlow = isInSignup && flowName === 'onboarding';
	const isTargetedAdminIntent = ! isInSignup && intent === 'plans-default-wpcom';
	const isTargetedView = isTargetedSignupFlow || isTargetedAdminIntent;
	const [ isLoading, assignment ] = useExperiment( EXPERIMENT_ID, { isEligible: isTargetedView } );
	const [ variantOverride, setVariantOverride ] = useState< ExperimentVariant | null >( null );

	let variant = ( assignment?.variationName ?? 'control' ) as ExperimentVariant;

	if ( isTargetedView && config.isEnabled( 'simplified-features-grid-a' ) ) {
		variant = 'fix_inaccuracies';
	} else if ( isTargetedView && config.isEnabled( 'simplified-features-grid-b' ) ) {
		variant = 'simplified';
	}

	if ( variantOverride ) {
		variant = variantOverride;
	}

	useEffect( () => setExperimentVariant( variant ), [ isLoading, variant ] );

	return { isLoading, isTargetedView, variant, setVariantOverride };
}

export default useSimplifiedFeaturesGridExperiment;
