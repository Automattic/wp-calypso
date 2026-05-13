import { readAchievementsSettingsQuery, readTeamsQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

export default function useAchievementsVisibility( profileUserLogin?: string ) {
	const featureEnabled = isEnabled( 'reader/achievements' );
	const currentUser = useSelector( getCurrentUser );
	const isOwnProfile = currentUser?.username === profileUserLogin;

	const { data: teamsData, isLoading: teamsLoading } = useQuery( {
		...readTeamsQuery(),
		enabled: featureEnabled,
	} );
	const isAutomattician = isAutomatticTeamMember( teamsData?.teams ?? [] );

	const { data: settingsData, isLoading: settingsLoading } = useQuery( {
		...readAchievementsSettingsQuery( profileUserLogin ),
		enabled: featureEnabled && isAutomattician && ! isOwnProfile && profileUserLogin != null,
	} );
	const isPublic = settingsData?.settings[ 'achievements-visibility' ] === 'public';

	return {
		isOwnProfile,
		isVisible: featureEnabled && isAutomattician && ( isOwnProfile || isPublic ),
		isLoading:
			featureEnabled &&
			( teamsLoading || ( ! isOwnProfile && isAutomattician && settingsLoading ) ),
	};
}
