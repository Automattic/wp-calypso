/**
 * Internal dependencies
 */
import { getVariationForUser } from 'calypso/state/experiments/selectors';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import config from 'calypso/config';

/**
 * Returns the onboarding URL.
 *
 *
 * @param {object}  state Global state tree
 * @returns {string}  URL of the onboarding flow for existing users.
 */

export default function getOnboardingUrl( state ) {
	const userLocale = getCurrentUserLocale( state );
	if ( [ 'en', 'en-gb' ].includes( userLocale ) ) {
		return config( 'new_onboarding_url' );
	}

	const existingUsersOnboardingVariant = getVariationForUser(
		state,
		'new_onboarding_existing_users_non_en_v4'
	);
	if ( existingUsersOnboardingVariant === 'treatment' ) {
		return config( 'new_onboarding_url' );
	}

	return config( 'signup_url' );
}
