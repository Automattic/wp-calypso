import config from '@automattic/calypso-config';
import { useExperiment } from 'calypso/lib/explat';
import {
	DIFM_OFFER_EXPERIMENT,
	DIFM_OFFER_FORCE_TREATMENT_FLAG,
	DIFM_OFFER_FORCED_ARM,
	isEligibleForDifmOffer,
	normalizeDifmOfferVariation,
} from '../../../utils/difm-offer';
import type { DifmOfferEligibilityInput, DifmOfferResult } from '../../../utils/difm-offer';

/**
 * Takes plain values rather than a site object so that callers holding either the
 * redux site model or the api-core site model can use it.
 */
export function useDifmOffer( input: DifmOfferEligibilityInput ): DifmOfferResult {
	const isEligible = isEligibleForDifmOffer( input );
	const isForcedTreatment = isEligible && config.isEnabled( DIFM_OFFER_FORCE_TREATMENT_FLAG );

	// Always call the hook. Keep ineligible users and forced testers out of the experiment.
	const [ isLoading, experimentAssignment ] = useExperiment( DIFM_OFFER_EXPERIMENT, {
		isEligible: isEligible && ! isForcedTreatment,
	} );

	if ( ! isEligible ) {
		return { isEligible, isLoading: false, variation: 'control' };
	}

	if ( isForcedTreatment ) {
		return { isEligible, isLoading: false, variation: DIFM_OFFER_FORCED_ARM };
	}

	return {
		isEligible,
		isLoading,
		variation: normalizeDifmOfferVariation( experimentAssignment?.variationName ),
	};
}
