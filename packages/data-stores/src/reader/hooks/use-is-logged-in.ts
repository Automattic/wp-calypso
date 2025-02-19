import { useSelect } from '@wordpress/data';
import { register as registerUserStore } from '../../user';
import type { UserSelect } from '../../user';

const USER_STORE = registerUserStore();

export default function useIsLoggedIn() {
	return useSelect( ( select ) => {
		const user = select( USER_STORE ) as UserSelect;
		return {
			id: user.getCurrentUser()?.ID,
			isLoggedIn: user.isCurrentUserLoggedIn(),
		};
	}, [] );
}
