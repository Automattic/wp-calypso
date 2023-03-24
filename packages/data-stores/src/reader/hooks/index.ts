import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { register as registerUserStore } from '../../user';
import { getSubkey } from '../helpers';
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

// Get subscriber's email address based on the subkey cookie
export const useSubscriberEmailAddress = () => {
	return useMemo( () => {
		const subkey = getSubkey();

		if ( ! subkey ) {
			return null;
		}

		const decodedSubkeyValue = decodeURIComponent( subkey );

		const firstPeriodIndex = decodedSubkeyValue.indexOf( '.' );
		if ( firstPeriodIndex === -1 ) {
			return null;
		}

		const emailAddress = decodedSubkeyValue.slice( firstPeriodIndex + 1 );
		return emailAddress;
	}, [] );
};
