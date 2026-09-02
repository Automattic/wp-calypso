import { useCallback, useEffect } from 'react';
import { useStore } from 'react-redux';
import { useDispatch, useSelector } from 'calypso/state';
import { setActiveAgency } from 'calypso/state/a8c-for-agencies/agency/actions';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { Agency as AgencyPayload } from '@automattic/api-core';
import type { Agency } from 'calypso/state/a8c-for-agencies/types';

/**
 * Bridges the shared partner directory screens into this app: exposes the
 * active agency, a Tracks adapter, and a helper that mirrors a saved agency
 * back into Redux. Also scrolls the section body back to the top on mount.
 */
export default function usePartnerDirectoryHost() {
	const dispatch = useDispatch();
	const store = useStore();

	const agency = useSelector( getActiveAgency );

	const recordTracks = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	// The shared mutations only refresh the dashboard's query cache, which
	// this app doesn't read, so saves are mirrored into Redux here. Merge
	// rather than replace: the PUT responses may omit fields the GET provides.
	// The cast bridges the api-core and Redux models of the agency.
	const mergeActiveAgency = useCallback(
		( response: AgencyPayload ) => {
			const previous = getActiveAgency( store.getState() );
			dispatch( setActiveAgency( { ...previous, ...response } as Agency ) );
		},
		[ dispatch, store ]
	);

	useEffect( () => {
		document.querySelector( '.partner-directory__body' )?.scrollTo( 0, 0 );
	}, [] );

	return { agency, recordTracks, mergeActiveAgency };
}
