import { hostingUpdateSchedulesQuery, siteCorePluginsQuery } from '@automattic/api-queries';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAppContext } from '../../../app/context';
import type { ScheduledUpdateRow } from '../types';

export function useScheduledUpdates() {
	const { queries } = useAppContext();
	const { data: scheduledUpdates, isLoading: isLoadingSchedules } = useQuery(
		hostingUpdateSchedulesQuery()
	);
	const { data: sites, isLoading: isLoadingSites } = useQuery( queries.sitesQuery() );
	const siteIds = Object.keys( scheduledUpdates?.sites ?? [] );
	const pluginQueries = useQueries( {
		queries: siteIds.map( ( id ) => siteCorePluginsQuery( Number( id ) ) ),
	} );

	const isLoadingPlugins = pluginQueries.some( ( query ) => query.isLoading );

	return useMemo( () => {
		if ( ! scheduledUpdates || ! sites ) {
			return {
				isLoading: isLoadingSchedules && isLoadingSites,
				scheduledUpdates: [],
			};
		}
		if ( ! scheduledUpdates.sites ) {
			return {
				isLoading: isLoadingSchedules && isLoadingSites,
				scheduledUpdates: [],
			};
		}

		// Build plugin slug to name map
		const pluginMap = new Map< string, string >();
		pluginQueries.forEach( ( query ) => {
			if ( query.data ) {
				query.data.forEach( ( plugin ) => {
					if ( plugin.plugin && plugin.name ) {
						pluginMap.set( plugin.plugin, plugin.name );
					}
				} );
			}
		} );

		const updates = scheduledUpdates.sites;
		const result: ScheduledUpdateRow[] = [];

		for ( const site_id in updates ) {
			for ( const scheduleId in updates[ site_id ] ) {
				const { timestamp, schedule, interval, last_run_timestamp, active, args } =
					updates[ site_id ][ scheduleId ];
				const id = `${ site_id }-${ scheduleId }-${ schedule }-${ interval }`;
				const site = sites.find( ( s ) => s.ID === parseInt( site_id, 10 ) );
				if ( ! site ) {
					continue;
				}
				// Map plugin slugs to names
				const pluginNames = args.map(
					( slug ) => pluginMap.get( slug.replace( '.php', '' ) ) || slug
				);
				result.push( {
					id,
					site: site,
					lastUpdate: last_run_timestamp,
					nextUpdate: timestamp,
					active,
					schedule,
					scheduleId,
					plugins: pluginNames,
				} );
			}
		}

		// sort by schedule (daily/weekly) then timestamp
		result.sort( ( a, b ) => {
			if ( a.schedule === b.schedule ) {
				return a.nextUpdate - b.nextUpdate;
			}
			return a.schedule.localeCompare( b.schedule );
		} );
		return {
			isLoading: isLoadingSchedules || isLoadingSites || isLoadingPlugins,
			scheduledUpdates: result,
		};
	}, [
		scheduledUpdates,
		sites,
		isLoadingSchedules,
		isLoadingSites,
		pluginQueries,
		isLoadingPlugins,
	] );
}
