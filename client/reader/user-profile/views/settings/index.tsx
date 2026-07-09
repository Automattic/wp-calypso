import './style.scss';
import { userPreferenceQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useState, useEffect } from 'react';
import useSetAchievementsVisibility from 'calypso/reader/components/achievements/use-set-achievements-visibility';
import { useSetProfileTabVisibility } from 'calypso/reader/data/user-profile';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import ProfileIdentityCard from './profile-identity-card';
import ProfileVisibilityCard from './profile-visibility-card';
import SitesVisibilityCard from './sites-visibility-card';
import type { ReaderUser } from '@automattic/api-core';
import type { ProfileTab } from 'calypso/reader/data/user-profile';

interface UserProfileSettingsProps {
	user: ReaderUser;
}

export default function UserProfileSettings( {
	user,
}: UserProfileSettingsProps ): JSX.Element | null {
	const currentUser = useSelector( getCurrentUser );
	const isOwnProfile = currentUser?.username === user.user_login;

	const { data: postsVisibility } = useQuery(
		userPreferenceQuery( 'reader-profile-posts-visibility' )
	);
	const { data: sitesVisibility } = useQuery(
		userPreferenceQuery( 'reader-profile-sites-visibility' )
	);

	const { data: achievementsVisibility } = useQuery(
		userPreferenceQuery( 'achievements-visibility' )
	);
	// Local state for immediate toggle feedback. Synced from query data on load.
	const [ visibility, setLocalVisibility ] = useState( achievementsVisibility ?? 'private' );
	useEffect(
		() => setLocalVisibility( achievementsVisibility ?? 'private' ),
		[ achievementsVisibility ]
	);

	const { setVisibility } = useSetProfileTabVisibility();
	const { setVisibility: setAchievementsVisibility } = useSetAchievementsVisibility();

	// Defense in depth — the tab and route are already owner-gated, but never render settings for
	// someone else's profile.
	if ( ! isOwnProfile ) {
		return null;
	}

	// Derived straight from the preference cache. `setVisibility` patches that cache optimistically,
	// so toggling updates these (and the profile nav tabs + top-sites strip) in real time.
	const postsVisible = postsVisibility !== 'hidden';
	const sitesVisible = sitesVisibility !== 'hidden';
	const achievementsVisible = visibility !== 'private';

	const handleVisibilityChange = ( tab: ProfileTab, visible: boolean ) => {
		setVisibility( tab, visible ? 'public' : 'hidden' );
	};

	const handleAchievementsVisibility = ( checked: boolean ) => {
		const newVisibility = checked ? 'public' : 'private';
		setLocalVisibility( newVisibility );
		setAchievementsVisibility( newVisibility );
	};

	return (
		<VStack spacing={ 6 } className="user-profile-settings">
			<ProfileIdentityCard user={ user } />
			<ProfileVisibilityCard
				postsVisible={ postsVisible }
				sitesVisible={ sitesVisible }
				achievementsVisible={ achievementsVisible }
				onChange={ handleVisibilityChange }
				onChangeAchievements={ handleAchievementsVisibility }
			/>
			<SitesVisibilityCard userId={ user.ID } sitesEnabled={ sitesVisible } />
		</VStack>
	);
}
