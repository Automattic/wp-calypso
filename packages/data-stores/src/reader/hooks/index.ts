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
	if ( loggedIn || ( document.cookie && document.cookie.indexOf( 'subkey=' ) !== -1 ) ) {
		return true;
	}

	return false;
};
