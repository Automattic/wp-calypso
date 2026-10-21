import { rawUserPreferencesQuery, userPreferenceOptimisticMutation } from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { recordAction } from 'calypso/reader/stats';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import type { UserPreferences } from '@automattic/api-core';

export type AchievementsVisibility = 'public' | 'private';

export default function useSetAchievementsVisibility() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation(
		userPreferenceOptimisticMutation( 'achievements-visibility' )
	);

	const setVisibility = ( next: AchievementsVisibility ) => {
		mutate( next, {
			onSuccess() {
				// `userPreferenceOptimisticMutation` patches the singleton QueryClient
				// in `@automattic/api-queries`, not the Calypso one this surface reads
				// from. Mirror the write here so `useQuery(userPreferenceQuery(...))`
				// in the notice and popover reflect the new value immediately.
				queryClient.setQueryData< UserPreferences >(
					rawUserPreferencesQuery().queryKey,
					( oldData ) => ( { ...oldData, 'achievements-visibility': next } )
				);
				dispatch(
					successNotice(
						next === 'public'
							? translate( 'Your achievements page is now public.' )
							: translate( 'Your achievements page is now private.' ),
						{ duration: 4000 }
					)
				);
				recordAction( `set_achievements_visibility_${ next }` );
				recordReaderTracksEvent( 'calypso_reader_achievements_settings_saved', {
					setting: 'achievements-visibility',
					value: next,
				} );
			},
			onError() {
				dispatch(
					errorNotice( translate( 'Failed to save the achievements visibility settings.' ), {
						duration: 4000,
					} )
				);
			},
		} );
	};

	return { setVisibility, isPending };
}
