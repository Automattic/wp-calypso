import config from '@automattic/calypso-config';
import { useLocale } from '@automattic/i18n-utils';
import { useExperiment } from 'calypso/lib/explat';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

const GUTENBOARDING_LOCALES = [ 'en', 'en-gb' ];

/**
 * Returns the onboarding URL.
 *
 * @returns {string}  URL of the onboarding flow for existing users.
 */
const useOnboardingUrl = (): string => {
	const userLocale = useLocale();
	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'calypso_site_create_existing_users_to_start_flow',
		{
			isEligible: ! isJetpackCloud() && GUTENBOARDING_LOCALES.includes( userLocale ),
		}
	);

	if ( isJetpackCloud() ) {
		return config( 'jetpack_connect_url' );
	}
	if ( GUTENBOARDING_LOCALES.includes( userLocale ) ) {
		if ( isLoadingExperimentAssignment ) {
			return '';
		}
		if ( 'treatment' === experimentAssignment?.variationName ) {
			return config( 'signup_url' );
		}
		return config( 'gutenboarding_url' );
	}

	return config( 'signup_url' );
};

export default useOnboardingUrl;
