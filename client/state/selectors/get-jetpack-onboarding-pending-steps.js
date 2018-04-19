/** @format */

/**
 * External dependencies
 */
import { reduce } from 'lodash';

/**
 * Internal dependencies
 */
import { JETPACK_ONBOARDING_STEPS as STEPS } from 'jetpack-onboarding/constants';
import { saveJetpackSettings } from 'state/jetpack/settings/actions';
import { getRequest } from 'state/selectors';

export default function getJetpackOnboardingPendingSteps( state, siteId, steps ) {
	const stepActionsMap = {
		[ STEPS.CONTACT_FORM ]: {
			addContactForm: true,
		},
		[ STEPS.WOOCOMMERCE ]: {
			installWooCommerce: true,
		},
		[ STEPS.STATS ]: {
			stats: true,
		},
	};

	return reduce(
		steps,
		( result, stepName ) => {
			result[ stepName ] = getRequest(
				state,
				saveJetpackSettings( siteId, { onboarding: stepActionsMap[ stepName ] } )
			).isLoading;
			return result;
		},
		{}
	);
}
