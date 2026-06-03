import { userPreferenceQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useState, useEffect } from 'react';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import useSetProfileTabVisibility from '../../hooks/use-set-profile-tab-visibility';
import ProfileIdentityCard from './profile-identity-card';
import ProfileVisibilityCard from './profile-visibility-card';
import SitesVisibilityCard from './sites-visibility-card';
import type { ProfileTab } from '../../hooks/use-set-profile-tab-visibility';
import type { ReaderUser } from '@automattic/api-core';

import './style.scss';

interface UserProfileSettingsProps {
	user: ReaderUser;
}

export default function UserProfileSettings( {
	user,
}: UserProfileSettingsProps ): JSX.Element | null {
	const currentUser = useSelector( getCurrentUser );
	const isOwnProfile = currentUser?.username === user.user_login;

	const { data: savedPostsVisibility } = useQuery(
		userPreferenceQuery( 'reader-profile-posts-visibility' )
	);
	const { data: savedSitesVisibility } = useQuery(
		userPreferenceQuery( 'reader-profile-sites-visibility' )
	);

	// Local state for immediate toggle feedback, synced from saved preferences on load.
	const [ postsVisible, setPostsVisible ] = useState( true );
	const [ sitesVisible, setSitesVisible ] = useState( true );
	useEffect( () => setPostsVisible( savedPostsVisibility !== 'hidden' ), [ savedPostsVisibility ] );
	useEffect( () => setSitesVisible( savedSitesVisibility !== 'hidden' ), [ savedSitesVisibility ] );

	const { setVisibility } = useSetProfileTabVisibility();

	// Defense in depth — the tab and route are already owner-gated, but never render settings for
	// someone else's profile.
	if ( ! isOwnProfile ) {
		return null;
	}

	const handleVisibilityChange = ( tab: ProfileTab, visible: boolean ) => {
		if ( tab === 'posts' ) {
			setPostsVisible( visible );
		} else {
			setSitesVisible( visible );
		}
		setVisibility( tab, visible ? 'public' : 'hidden' );
	};

	return (
		<VStack spacing={ 6 } className="user-profile-settings">
			<ProfileIdentityCard user={ user } />
			<ProfileVisibilityCard
				postsVisible={ postsVisible }
				sitesVisible={ sitesVisible }
				onChange={ handleVisibilityChange }
			/>
			<SitesVisibilityCard userId={ user.ID } sitesEnabled={ sitesVisible } />
		</VStack>
	);
}
