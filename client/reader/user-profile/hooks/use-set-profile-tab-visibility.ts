import { rawUserPreferencesQuery, userPreferenceOptimisticMutation } from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import type { UserPreferences } from '@automattic/api-core';

export type ProfileTab = 'posts' | 'sites';
export type ProfileTabVisibility = 'public' | 'hidden';

const PREFERENCE_KEY: Record< ProfileTab, keyof UserPreferences > = {
	posts: 'reader-profile-posts-visibility',
	sites: 'reader-profile-sites-visibility',
};

/**
 * Writes the Posts/Sites tab visibility preferences for the current user's Reader profile.
 *
 * `userPreferenceOptimisticMutation` patches the singleton QueryClient in `@automattic/api-queries`,
 * not the Calypso one this surface reads from, so we mirror the write into the active client on
 * success (mirrors `useSetAchievementsVisibility`).
 */
export default function useSetProfileTabVisibility() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const queryClient = useQueryClient();

	const postsMutation = useMutation( userPreferenceOptimisticMutation( PREFERENCE_KEY.posts ) );
	const sitesMutation = useMutation( userPreferenceOptimisticMutation( PREFERENCE_KEY.sites ) );

	const setVisibility = ( tab: ProfileTab, next: ProfileTabVisibility ) => {
		const key = PREFERENCE_KEY[ tab ];
		const mutation = tab === 'posts' ? postsMutation : sitesMutation;
		mutation.mutate( next, {
			onSuccess() {
				queryClient.setQueryData< UserPreferences >(
					rawUserPreferencesQuery().queryKey,
					( oldData ) => ( { ...oldData, [ key ]: next } )
				);
				recordReaderTracksEvent( 'calypso_reader_profile_visibility_toggled', {
					tab,
					visibility: next,
				} );
			},
			onError() {
				dispatch(
					errorNotice( translate( 'Failed to save your profile visibility settings.' ), {
						duration: 4000,
					} )
				);
			},
		} );
	};

	return {
		setVisibility,
		isPending: postsMutation.isPending || sitesMutation.isPending,
	};
}
