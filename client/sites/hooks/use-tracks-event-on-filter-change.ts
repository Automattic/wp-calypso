import { useCallback, useEffect, useRef } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSiteStatusGroups } from '../components/sites-dataviews';
import type { Filter } from '@automattic/dataviews';

type TracksEventData = [ name: string, value: string ];

/**
 * Submit a Tracks event when a data view filter is used.
 */
export function useTracksEventOnFilterChange( filters: Filter[] ) {
	const siteStatusGroups = useSiteStatusGroups();

	const getTracksEventDataForFilter = useCallback(
		( fieldId: string, value: any ): TracksEventData | null => {
			if ( value === undefined ) {
				return null;
			}

			switch ( fieldId ) {
				case 'status': {
					const statusGroup = siteStatusGroups.find( ( group ) => group.value === value );
					return [ 'calypso_sites_dashboard_filter_status', statusGroup?.slug ?? '' ];
				}

				default:
					return null;
			}
		},
		[ siteStatusGroups ]
	);

	const previousViewFilters = useRef< Record< string, string > >( {} );

	useEffect( () => {
		const filterTracksEvents = filters
			.map( ( filter ) => getTracksEventDataForFilter( filter.field, filter.value ) )
			.filter( ( filter ): filter is TracksEventData => filter !== null );

		filterTracksEvents.forEach( ( [ name, value ] ) => {
			if ( previousViewFilters.current[ name ] !== value ) {
				recordTracksEvent( name, {
					value: value,
				} );
			}
		} );

		previousViewFilters.current = Object.fromEntries( filterTracksEvents );
	}, [ filters, getTracksEventDataForFilter ] );
}
