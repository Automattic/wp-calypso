import { useSelect } from '@wordpress/data';
import { register as registerUserStore } from '../../user';
import type { UserSelect } from '../../user';

const USER_STORE = registerUserStore( { client_id: '', client_secret: '' } );

export const useIsLoggedIn = () => {
	return useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
		[]
	) as boolean;
};

export const useIsQueryEnabled = () => {
	const loggedIn = useIsLoggedIn();
	if ( loggedIn || window.currentUser?.subscriptionManagementSubkey ) {
		return true;
	}

	return false;
};
