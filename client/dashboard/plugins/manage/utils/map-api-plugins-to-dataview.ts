import { getAllowedPluginActions } from '../../plugin/utils/get-allowed-plugin-actions';
import type { PluginListRow } from '../types';
import type { PluginItem, PluginsResponse, Site } from '@automattic/api-core';

type Aggregated = {
	name: string;
	slug: string;
	count: number;
	activeCount: number;
	updateCount: number;
	autoupdateAllowedCount: number;
	autoupdateCount: number;
	siteIds: number[];
	isManaged: boolean;
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

export function mapApiPluginsToDataViewPlugins(
	userSites?: Site[],
	response?: PluginsResponse
): PluginListRow[] {
	if ( ! userSites || ! response?.sites ) {
		return [];
	}

	const sitesById = userSites
		.filter( ( site ) => site.capabilities.update_plugins )
		.reduce( ( acc, site ) => {
			acc.set( site.ID, site );
			return acc;
		}, new Map< number, Site >() );

	const pluginsBySite = response.sites;
	const map = new Map< string, Aggregated >();

	Object.entries( pluginsBySite ).forEach( ( [ siteIdStr, plugins ] ) => {
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
				autoupdateAllowedCount: 0,
				autoupdateCount: 0,
				isManaged: false,
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
			if ( p.is_managed ) {
				entry.isManaged = true;
			}

			const site = sitesById.get( siteId );
			if ( site ) {
				const { autoupdate } = getAllowedPluginActions(
					{ isPluginActive: p.active, ...site, isPluginManaged: entry.isManaged },
					p.slug
				);
				entry.autoupdateAllowedCount += autoupdate ? 1 : 0;
			}
			map.set( p.id, entry );
		} );
	} );

	return Array.from( map.entries() ).map(
		( [
			id,
			{
				name,
				slug,
				count,
				activeCount,
				updateCount,
				autoupdateAllowedCount,
				autoupdateCount,
				siteIds,
				isManaged,
			},
		] ) => ( {
			id,
			name,
			icons: null,
			slug,
			sitesCount: count,
			hasUpdate: mapCountToQuantifier( updateCount, count ),
			isActive: mapCountToQuantifier( activeCount, count ),
			areAutoUpdatesAllowed: mapCountToQuantifier( autoupdateAllowedCount, count ),
			areAutoUpdatesEnabled: mapCountToQuantifier( autoupdateCount, count ),
			siteIds,
			isManaged,
		} )
	);
}
