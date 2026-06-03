import { readProfileSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

type VisibilityKey = 'reader-profile-posts-visibility' | 'reader-profile-sites-visibility';

/**
 * Resolves which of the Posts/Sites tabs should be shown on a Reader user profile.
 *
 * The owner always sees all of their own tabs (and never hits the public read endpoint). For
 * everyone else we default to visible while the settings are loading (to avoid a flicker) but
 * fail closed on error, so an API outage can never expose a tab the owner has chosen to hide.
 */
export default function useProfileTabVisibility( profileUserLogin?: string ) {
	const currentUser = useSelector( getCurrentUser );
	const isOwnProfile = currentUser?.username === profileUserLogin;

	const {
		data: settingsData,
		isLoading: settingsLoading,
		isError,
	} = useQuery( {
		...readProfileSettingsQuery( profileUserLogin ),
		enabled: ! isOwnProfile && profileUserLogin != null,
	} );

	const resolveVisible = ( key: VisibilityKey ): boolean => {
		if ( isOwnProfile ) {
			return true;
		}
		if ( isError ) {
			return false; // fail closed
		}
		if ( ! settingsData ) {
			return true; // default visible while loading
		}
		return settingsData.settings[ key ] !== 'hidden';
	};

	return {
		isOwnProfile,
		showPosts: resolveVisible( 'reader-profile-posts-visibility' ),
		showSites: resolveVisible( 'reader-profile-sites-visibility' ),
		isLoading: ! isOwnProfile && settingsLoading,
	};
}
