/**
 * Internal dependencies
 */
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import config from '@automattic/calypso-config';

/**
 * Returns the onboarding URL.
 *
 *
 * @param {object}  state Global state tree
 * @returns {string}  URL of the onboarding flow for existing users.
 */

const GUTENBOARDING_LOCALES = [ 'en', 'en-gb' ];

export default function getOnboardingUrl( state ) {
	if ( isJetpackCloud() ) {
		return config( 'jetpack_connect_url' );
	}

	const userLocale = getCurrentUserLocale( state );
	if ( GUTENBOARDING_LOCALES.includes( userLocale ) ) {
		return config( 'gutenboarding_url' );
	}

	return config( 'signup_url' );
}
