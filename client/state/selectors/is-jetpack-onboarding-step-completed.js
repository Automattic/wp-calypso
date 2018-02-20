/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getJetpackOnboardingSettings } from 'state/selectors';
import { JETPACK_ONBOARDING_STEPS as STEPS } from 'jetpack-onboarding/constants';

/**
 * Returns whether a Jetpack onboarding step is completed or not.
 *
 * @param  {Object}   state     Global state tree.
 * @param  {Integer}  siteId    Unconnected site ID.
 * @param  {String}   stepName  Name of the Jetpack onboarding step.
 * @return {Boolean}            True if step has been completed, false otherwise.
 */
export default createSelector(
	( state, siteId, stepName ) => {
		const settings = getJetpackOnboardingSettings( state, siteId );

		if ( ! settings ) {
			return false;
		}

		switch ( stepName ) {
			case STEPS.SITE_TITLE:
				const titleModified = get( settings, 'siteTitle', '' ) !== '';
				const defaultDescription = translate( 'Just another WordPress site' );
				const descriptionModified =
					get( settings, 'siteDescription', defaultDescription ) !== defaultDescription;
				return titleModified || descriptionModified;
			case STEPS.SITE_TYPE:
				return !! get( settings, 'siteType' );
			case STEPS.HOMEPAGE:
				return !! get( settings, 'homepageFormat' );
			case STEPS.CONTACT_FORM:
				return !! get( settings, 'addContactForm' );
			case STEPS.BUSINESS_ADDRESS:
				return !! get( settings, 'businessAddress' );
			case STEPS.WOOCOMMERCE:
				return !! get( settings, 'installWooCommerce' );
			case STEPS.STATS:
				return !! get( settings, 'stats' );
			default:
				return false;
		}
	},
	state => [ state.jetpackOnboarding.settings ]
);
