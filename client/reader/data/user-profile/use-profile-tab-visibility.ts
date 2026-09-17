import { readProfileSettingsQuery, userPreferenceQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

type VisibilityKey = 'reader-profile-posts-visibility' | 'reader-profile-sites-visibility';
type Visibility = 'public' | 'hidden';

/**
 * Resolves which of the Posts/Sites tabs should be shown on a Reader user profile.
 *
 * The owner reads their own preference so the tabs (and the top-sites strip) reflect their choices
 * in real time as they toggle them in the profile settings. Everyone else reads the resolved
 * visibility from the public endpoint: we default to visible while it loads (to avoid a flicker)
 * but fail closed on error, so an API outage can never expose a tab the owner has chosen to hide.
 */
export function useProfileTabVisibility( profileUserLogin?: string ) {
	const currentUser = useSelector( getCurrentUser );
	const isOwnProfile = currentUser?.username === profileUserLogin;

	// For others profile.
	const {
		data: settingsData,
		isLoading: settingsLoading,
		isError,
	} = useQuery( {
		...readProfileSettingsQuery( profileUserLogin ?? '' ),
		enabled: ! isOwnProfile && profileUserLogin != null,
	} );

	// For own profile.
	const { data: ownPostsVisibility } = useQuery( {
		...userPreferenceQuery( 'reader-profile-posts-visibility' ),
		enabled: isOwnProfile,
	} );
	const { data: ownSitesVisibility } = useQuery( {
		...userPreferenceQuery( 'reader-profile-sites-visibility' ),
		enabled: isOwnProfile,
	} );

	const resolveVisible = ( key: VisibilityKey, ownValue?: Visibility ): boolean => {
		if ( isOwnProfile ) {
			return ownValue !== 'hidden'; // defaults to visible (undefined while loading / unset)
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
		showPosts:
			resolveVisible( 'reader-profile-posts-visibility', ownPostsVisibility ) || isOwnProfile,
		isPostsPublic: resolveVisible( 'reader-profile-posts-visibility', ownPostsVisibility ),
		showSites:
			resolveVisible( 'reader-profile-sites-visibility', ownSitesVisibility ) || isOwnProfile,
		isSitesPublic: resolveVisible( 'reader-profile-sites-visibility', ownSitesVisibility ),
		isLoading: ! isOwnProfile && settingsLoading,
	};
}
