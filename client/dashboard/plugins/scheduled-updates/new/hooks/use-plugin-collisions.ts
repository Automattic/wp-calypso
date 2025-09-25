import { hostingUpdateSchedulesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { validatePlugins } from '../helpers';
import type { HostingUpdateSchedulesResponse } from '@automattic/api-core';

/**
 * Build per-site plugin sets from the multisite aggregated response
 */
function getPluginSetsBySiteFromMultisite(
	data: HostingUpdateSchedulesResponse
): Record< number, string[][] > {
	const result: Record< number, string[][] > = {};
	const sites = data?.sites;

	if ( ! sites ) {
		return result;
	}

	Object.entries( sites ).forEach( ( [ siteIdStr, schedulesMap ] ) => {
		const siteId = Number( siteIdStr );
		const sets: string[][] = [];
		Object.values( schedulesMap || {} ).forEach( ( sched ) => {
			if ( Array.isArray( sched.args ) ) {
				sets.push( sched.args as string[] );
			}
		} );
		result[ siteId ] = sets;
	} );

	return result;
}

/**
 * Given a list of site IDs and a selected plugin set,
 * return an error message if a site already has an identical plugin set scheduled,
 * along with the sites that have a collision, if any.
 */
export function usePluginCollisionsFromMultisite(
	siteIds: number[],
	selectedPlugins: string[]
): { isLoading: boolean; error: string; collidingSiteIds: number[] } {
	const { data, isLoading } = useQuery( hostingUpdateSchedulesQuery() );

	if ( isLoading ) {
		return { isLoading: true, error: '', collidingSiteIds: [] };
	}

	// Short-circuit if no plugins selected; CTA should already be disabled
	if ( ! selectedPlugins.length ) {
		return { isLoading: false, error: '', collidingSiteIds: [] };
	}

	const bySite = data ? getPluginSetsBySiteFromMultisite( data ) : {};

	let firstError = '';
	const collidingSiteIds: number[] = siteIds.filter( ( id ) => {
		const error = validatePlugins( selectedPlugins, bySite[ id ] || [] );
		if ( error && ! firstError ) {
			firstError = error;
		}
		return !! error;
	} );

	return { isLoading: false, error: firstError, collidingSiteIds };
}
