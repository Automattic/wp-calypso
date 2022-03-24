import config from '@automattic/calypso-config';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

/**
 * Returns the onboarding URL.
 *
 * @returns {string}  URL of the onboarding flow for existing users.
 */
export default function getOnboardingUrl() {
	if ( isJetpackCloud() ) {
		return config( 'jetpack_connect_url' );
	}
	return config( 'signup_url' );
}
