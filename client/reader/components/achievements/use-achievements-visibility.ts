import { readAchievementsSettingsQuery, userPreferenceQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

export default function useAchievementsVisibility( profileUserLogin?: string ) {
	const currentUser = useSelector( getCurrentUser );
	const isOwnProfile = currentUser?.username === profileUserLogin;

	// For others profile.
	const { data: settingsData, isLoading: settingsLoading } = useQuery( {
		...readAchievementsSettingsQuery( profileUserLogin ),
		enabled: ! isOwnProfile && !! profileUserLogin,
	} );

	// For own profile.
	const { data: achievementsVisibility } = useQuery( {
		...userPreferenceQuery( 'achievements-visibility' ),
		enabled: isOwnProfile,
	} );

	const isPublic = isOwnProfile
		? achievementsVisibility === 'public'
		: settingsData?.settings[ 'achievements-visibility' ] === 'public';

	return {
		isOwnProfile,
		isPublic,
		isVisible: isOwnProfile || isPublic,
		isLoading: ! isOwnProfile && settingsLoading,
	};
}
