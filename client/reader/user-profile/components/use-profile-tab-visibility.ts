import { readProfileSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

export default function useProfileTabVisibility( profileUserLogin?: string ) {
	const currentUser = useSelector( getCurrentUser );
	const { data, isLoading } = useQuery( readProfileSettingsQuery( profileUserLogin ) );

	return {
		isOwnProfile: currentUser?.username === profileUserLogin,
		showPosts: data?.settings[ 'reader-profile-posts-visibility' ] !== 'hidden',
		showSites: data?.settings[ 'reader-profile-sites-visibility' ] !== 'hidden',
		isLoading,
	};
}
