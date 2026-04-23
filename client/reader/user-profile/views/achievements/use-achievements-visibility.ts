import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

export function useAchievementsVisibility( profileUserLogin?: string ) {
	const currentUser = useSelector( getCurrentUser );
	const isOwnProfile = currentUser?.username === profileUserLogin;

	// The achievements page is only visible to the profile owner for now.
	// Public visibility will require a server-side check once a public API exists.
	return {
		isOwnProfile,
		isVisible: isOwnProfile,
	};
}
