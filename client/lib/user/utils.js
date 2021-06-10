/**
 * Internal dependencies
 */
import user from 'calypso/lib/user';
import { getLogoutUrl } from 'calypso/lib/user/shared-utils';

const userUtils = {
	logout( redirect ) {
		const logoutUrl = getLogoutUrl( user().get(), redirect );

		// Clear any data stored locally within the user data module or localStorage
		user()
			.clear()
			.then( () => {
				window.location.href = logoutUrl;
			} );
	},

	isLoggedIn() {
		return Boolean( user().data );
	},
};

export default userUtils;
