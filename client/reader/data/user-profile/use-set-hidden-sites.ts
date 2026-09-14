import { rawUserPreferencesQuery, userPreferenceMutation } from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import type { UserPreferences } from '@automattic/api-core';

const PREFERENCE_KEY = 'reader-profile-hidden-sites';

/**
 * Writes the list of site IDs the current user has hidden from their public Reader profile.
 *
 * Writes are non-optimistic with a per-site pending indicator (the value is an array, so we avoid
 * optimistic merge races). On success we mirror the new array into the active Calypso QueryClient
 * (the mutation factory patches the `@automattic/api-queries` singleton, not this surface's client).
 */
export function useSetHiddenSites( hiddenSites: number[] ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const queryClient = useQueryClient();
	const [ pendingSiteId, setPendingSiteId ] = useState< number | null >( null );

	const { mutate, isPending } = useMutation( userPreferenceMutation( PREFERENCE_KEY ) );

	const commit = (
		nextHiddenSites: number[],
		{ onDone, track }: { onDone: () => void; track: () => void }
	) => {
		// Patch the active (Calypso) client up front so the settings list, the Sites tab and the
		// top-sites strip reflect the change immediately. Roll back on error.
		const previous = queryClient.getQueryData< UserPreferences >(
			rawUserPreferencesQuery().queryKey
		);
		queryClient.setQueryData< UserPreferences >(
			rawUserPreferencesQuery().queryKey,
			( oldData ) => ( { ...oldData, [ PREFERENCE_KEY ]: nextHiddenSites } )
		);

		mutate( nextHiddenSites, {
			onSuccess() {
				track();
			},
			onError() {
				queryClient.setQueryData( rawUserPreferencesQuery().queryKey, previous );
				dispatch(
					errorNotice( translate( 'Failed to update which sites are visible on your profile.' ), {
						duration: 4000,
					} )
				);
			},
			onSettled() {
				onDone();
			},
		} );
	};

	const setSiteHidden = ( siteId: number, hidden: boolean ) => {
		const nextHiddenSites = hidden
			? Array.from( new Set( [ ...hiddenSites, siteId ] ) )
			: hiddenSites.filter( ( id ) => id !== siteId );

		setPendingSiteId( siteId );
		commit( nextHiddenSites, {
			onDone: () => setPendingSiteId( null ),
			track: () =>
				recordReaderTracksEvent( 'calypso_reader_profile_site_visibility_toggled', {
					site_id: siteId,
					hidden: hidden ? 1 : 0,
				} ),
		} );
	};

	// Hide every site (`hidden`) or show every site, in a single write.
	const setAllHidden = ( hidden: boolean, allSiteIds: number[] ) => {
		commit( hidden ? [ ...allSiteIds ] : [], {
			onDone: () => {},
			track: () =>
				recordReaderTracksEvent( 'calypso_reader_profile_all_sites_visibility_toggled', {
					hidden: hidden ? 1 : 0,
				} ),
		} );
	};

	return { setSiteHidden, setAllHidden, pendingSiteId, isPending };
}
