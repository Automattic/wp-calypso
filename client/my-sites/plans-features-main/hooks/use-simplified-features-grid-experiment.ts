import {
	setSimplifiedFeaturesGridExperimentVariant as setExperimentVariant,
	SimplifiedFeaturesGridExperimentVariant as ExperimentVariant,
} from '@automattic/calypso-products';
import { useEffect, useState } from 'react';

interface Params {
	flowName?: string | null;
	intent?: string;
	isInSignup: boolean;
}

/**
 * This function has been modified to always 'simplified' if isTargetedView is true.
 * It will be removed in #95977.
 */
function useSimplifiedFeaturesGridExperiment( { flowName, isInSignup, intent }: Params ): {
	isLoading: boolean;
	isTargetedView: boolean;
	variant: ExperimentVariant;
	setVariantOverride: ( variant: ExperimentVariant | null ) => void;
} {
	const isTargetedSignupFlow = isInSignup && flowName === 'onboarding';
	const isTargetedAdminIntent = ! isInSignup && intent === 'plans-default-wpcom';
	const isTargetedView = isTargetedSignupFlow || isTargetedAdminIntent;
	const [ variantOverride, setVariantOverride ] = useState< ExperimentVariant | null >( null );

	let variant: ExperimentVariant = 'control';

	if ( isTargetedView ) {
		variant = 'simplified';
	}
	if ( variantOverride ) {
		variant = variantOverride;
	}

	useEffect( () => setExperimentVariant( variant ), [ variant ] );

	return { isLoading: false, isTargetedView, variant, setVariantOverride };
}

export default useSimplifiedFeaturesGridExperiment;
