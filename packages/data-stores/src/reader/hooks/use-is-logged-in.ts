import { useSelect } from '@wordpress/data';
import { register as registerUserStore } from '../../user';
import type { UserSelect } from '../../user';

const USER_STORE = registerUserStore();

const useIsLoggedIn = () => {
	const currentUser = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
		[]
	);

	return {
		id: currentUser?.ID,
		isLoggedIn: useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		),
	};
};

export default useIsLoggedIn;
