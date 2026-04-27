import { readAchievementsSettingsQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

export default function useAchievementsVisibility( profileUserLogin?: string ) {
	const currentUser = useSelector( getCurrentUser );
	const isOwnProfile = currentUser?.username === profileUserLogin;

	const { data, isLoading } = useQuery( {
		...readAchievementsSettingsQuery( profileUserLogin ),
		enabled: isEnabled( 'reader/achievements' ) && ! isOwnProfile && profileUserLogin != null,
	} );

	const isPublic = data?.settings[ 'achievements-visibility' ] === 'public';

	return {
		isOwnProfile,
		isVisible: isOwnProfile || isPublic,
		isLoading: ! isOwnProfile && isLoading,
	};
}
