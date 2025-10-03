import config from '@automattic/calypso-config';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

/**
 * Returns the onboarding URL.
 * @returns {string}  URL of the onboarding flow for existing users.
 */
export function onboardingUrl() {
	if ( isJetpackCloud() ) {
		return config( 'jetpack_connect_url' );
	}
	return '/start';
}
