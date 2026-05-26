import './style.scss';

import {
	readProfileSettingsQuery,
	userPreferenceOptimisticMutation,
} from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DropdownMenu } from '@wordpress/components';
import { moreHorizontal } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import type { ReadProfileSettingsResponse } from '@automattic/api-core';

type Visibility = 'public' | 'hidden';
type VisibilityKey = 'reader-profile-posts-visibility' | 'reader-profile-sites-visibility';

interface ProfileOptionsMenuProps {
	userLogin: string;
	showPosts: boolean;
	showSites: boolean;
}

export default function ProfileOptionsMenu( {
	userLogin,
	showPosts,
	showSites,
}: ProfileOptionsMenuProps ): JSX.Element {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const profileSettingsKey = readProfileSettingsQuery( userLogin ).queryKey;

	const { mutate: mutatePosts } = useMutation(
		userPreferenceOptimisticMutation( 'reader-profile-posts-visibility' )
	);
	const { mutate: mutateSites } = useMutation(
		userPreferenceOptimisticMutation( 'reader-profile-sites-visibility' )
	);

	const patchCache = ( key: VisibilityKey, value: Visibility ) => {
		queryClient.setQueryData< ReadProfileSettingsResponse >( profileSettingsKey, ( prev ) =>
			prev ? { settings: { ...prev.settings, [ key ]: value } } : prev
		);
	};

	const toggle = ( key: VisibilityKey, currentlyVisible: boolean, mutate: typeof mutatePosts ) => {
		const next: Visibility = currentlyVisible ? 'hidden' : 'public';
		const previous: Visibility = currentlyVisible ? 'public' : 'hidden';
		patchCache( key, next );
		mutate( next, {
			onError() {
				patchCache( key, previous );
				dispatch(
					errorNotice( translate( 'Failed to update profile visibility.' ), { duration: 4000 } )
				);
			},
			onSettled() {
				queryClient.invalidateQueries( { queryKey: profileSettingsKey } );
			},
		} );
	};

	return (
		<DropdownMenu
			className="user-profile-header__options-menu"
			popoverProps={ {
				placement: 'bottom-end',
				className: 'user-profile-header__options-popover',
			} }
			icon={ moreHorizontal }
			label={ translate( 'Profile options' ) as string }
			controls={ [
				{
					title: ( showPosts
						? translate( 'Hide my posts' )
						: translate( 'Show my posts' ) ) as string,
					onClick: () => toggle( 'reader-profile-posts-visibility', showPosts, mutatePosts ),
				},
				{
					title: ( showSites
						? translate( 'Hide my sites' )
						: translate( 'Show my sites' ) ) as string,
					onClick: () => toggle( 'reader-profile-sites-visibility', showSites, mutateSites ),
				},
			] }
		/>
	);
}
