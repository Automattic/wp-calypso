import { isEnabled } from '@automattic/calypso-config';
import { useSelect } from '@wordpress/data';
import { USER_STORE } from '../stores/user';

const FSE_BETA_ROLLOUT_PERCENTAGE = 1;

export default function useFseBetaEligibility(): boolean {
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );

	// FSE Beta is only active for existing users.
	if ( ! currentUser?.ID ) {
		return false;
	}

	// Force the FSE Beta on development and Horizon environments.
	if ( isEnabled( 'full-site-editing/beta-opt-in' ) ) {
		return true;
	}

	// Check if the user ID is part of the eligible percentage.
	return currentUser.ID % 100 < FSE_BETA_ROLLOUT_PERCENTAGE;
}
