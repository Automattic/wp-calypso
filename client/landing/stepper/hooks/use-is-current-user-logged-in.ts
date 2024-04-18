import { useSelect } from '@wordpress/data';
import { USER_STORE } from '../stores';
import type { UserSelect } from '@automattic/data-stores';

export const useIsCurrentUserLoggedIn = () => {
	const userIsLoggedIn = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
		[]
	);

	return userIsLoggedIn;
};
