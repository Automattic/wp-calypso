import { readAchievementsSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

export default function useAchievementsVisibility( profileUserLogin?: string ) {
	const currentUser = useSelector( getCurrentUser );
	const isOwnProfile = currentUser?.username === profileUserLogin;

	const { data: settingsData, isLoading: settingsLoading } = useQuery( {
		...readAchievementsSettingsQuery( profileUserLogin ),
		enabled: ! isOwnProfile && profileUserLogin != null,
	} );
	const isPublic = settingsData?.settings[ 'achievements-visibility' ] === 'public';

	return {
		isOwnProfile,
		isVisible: isOwnProfile || isPublic,
		isLoading: ! isOwnProfile && settingsLoading,
	};
}
