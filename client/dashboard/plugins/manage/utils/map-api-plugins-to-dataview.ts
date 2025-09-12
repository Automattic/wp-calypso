import type { PluginListRow } from '../types';
import type { PluginItem, PluginsResponse } from '@automattic/api-core';

type Aggregated = {
	name: string;
	slug: string;
	count: number;
	activeCount: number;
	updateCount: number;
	autoupdateCount: number;
	siteIds: number[];
};

function mapCountToQuantifier( count: number, total: number ): 'all' | 'some' | 'none' {
	if ( total === 0 || count === 0 ) {
		return 'none';
	}
	if ( count === total ) {
		return 'all';
	}
	return 'some';
}

export function mapApiPluginsToDataViewPlugins( response?: PluginsResponse ): PluginListRow[] {
	if ( ! response?.sites ) {
		return [];
	}
	const sites = response.sites;
	const map = new Map< string, Aggregated >();
	Object.entries( sites ).forEach( ( [ siteIdStr, plugins ] ) => {
		const siteId = Number( siteIdStr );
		( plugins as PluginItem[] ).forEach( ( p ) => {
			if ( ! p.id ) {
				return;
			}

			const entry: Aggregated = map.get( p.id ) || {
				name: p.name,
				slug: p.slug,
				count: 0,
				activeCount: 0,
				updateCount: 0,
				autoupdateCount: 0,
				siteIds: [],
			};
			entry.count += 1;
			entry.siteIds.push( siteId );
			if ( p.active ) {
				entry.activeCount += 1;
			}
			if ( p.update ) {
				entry.updateCount += 1;
			}
			if ( p.autoupdate ) {
				entry.autoupdateCount += 1;
			}
			map.set( p.id, entry );
		} );
	} );

	return Array.from( map.entries() ).map(
		( [ id, { name, slug, count, activeCount, updateCount, autoupdateCount, siteIds } ] ) => ( {
			id,
			name,
			slug,
			sitesCount: count,
			hasUpdate: mapCountToQuantifier( updateCount, count ),
			isActive: mapCountToQuantifier( activeCount, count ),
			areAutoUpdatesEnabled: mapCountToQuantifier( autoupdateCount, count ),
			siteIds,
		} )
	);
}
