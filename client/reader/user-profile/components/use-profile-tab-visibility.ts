import { readProfileSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

export function useProfileTabVisibility( profileUserLogin?: string ) {
	const currentUser = useSelector( getCurrentUser );
	const { data, isLoading, isError } = useQuery( readProfileSettingsQuery( profileUserLogin ) );

	// Fail closed on query error so an outage can't expose a tab the owner has
	// hidden. Loading state stays default-visible to avoid flicker on the common
	// case where everything is public.
	const showPosts = ! isError && data?.settings[ 'reader-profile-posts-visibility' ] !== 'hidden';
	const showSites = ! isError && data?.settings[ 'reader-profile-sites-visibility' ] !== 'hidden';

	return {
		isOwnProfile: currentUser?.username === profileUserLogin,
		showPosts,
		showSites,
		isLoading,
	};
}
