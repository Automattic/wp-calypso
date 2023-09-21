import { User } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import type { UserSelect } from '@automattic/data-stores';

const USER_STORE = User.register( {
	client_id: '',
	client_secret: '',
} );

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
