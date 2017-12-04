/** @format */

/**
 * Internal dependencies
 */
import {
	JETPACK_ONBOARDING_SITE_DESCRIPTION_SET,
	JETPACK_ONBOARDING_SITE_TITLE_SET,
} from 'state/action-types';

/**
 * Returns an action object to signal an update of the site title of a Jetpack Onboading site.
 *
 * @param  {String}  siteTitle  Site title
 * @return {Object}             Action object
 */
export const setSiteTitle = siteTitle => ( {
	type: JETPACK_ONBOARDING_SITE_TITLE_SET,
	siteTitle,
} );

/**
 * Returns an action object to signal an update of the site description of a Jetpack Onboading site.
 *
 * @param  {String}  siteDescription  Site description
 * @return {Object}                   Action object
 */
export const setSiteDescription = siteDescription => ( {
	type: JETPACK_ONBOARDING_SITE_DESCRIPTION_SET,
	siteDescription,
} );
