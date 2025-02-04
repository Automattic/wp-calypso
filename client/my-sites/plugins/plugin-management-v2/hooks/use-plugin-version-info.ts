import { useMemo } from 'react';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { useSelector } from 'calypso/state';
import { getPluginOnSites } from 'calypso/state/plugins/installed/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import type { PluginComponentProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

export default function usePluginVersionInfo(
	plugin: PluginComponentProps,
	selectedSiteId?: number
): {
	currentVersionsRange: { min: string; max: string };
	updatedVersions: string[];
	hasUpdate: boolean;
	updateableSites: number;
} {
	const allSites = useSelector( getSites );

	const sites = plugin?.sites
		? Object.keys( plugin.sites ).map( ( siteId ) => {
				const site = allSites.find( ( s ) => s?.ID === parseInt( siteId ) );
				return {
					...site,
					...plugin.sites[ siteId ],
				} as any; // This must be cast as any until this file is updated to work with the selectors in state/plugins/installed/selectors
		  } )
		: [];

	const siteIds = siteObjectsToSiteIds( sites );

	const updateableSites = sites.filter(
		( site ) => site.canUpdateFiles && site.version !== plugin.update?.new_version
	).length;

	const pluginsOnSites: any = useSelector( ( state ) =>
		getPluginOnSites( state, siteIds, plugin?.slug )
	);

	const getSitePlugin = ( site: SiteDetails ) => {
		const siteId = selectedSiteId || site.ID;
		return pluginsOnSites?.sites[ siteId ];
	};

	let hasUpdate = false;

	if ( selectedSiteId ) {
		const selectedSite = sites.find( ( site ) => site.ID === selectedSiteId );
		if ( selectedSite ) {
			const sitePlugin = getSitePlugin( selectedSite );
			hasUpdate = sitePlugin?.update?.new_version && selectedSite.canUpdateFiles;
		}
	} else {
		hasUpdate = sites.some( ( site ) => {
			const sitePlugin = getSitePlugin( site );
			return sitePlugin?.update?.new_version && site.canUpdateFiles;
		} );
	}

	const updatedVersions = sites
		.map( ( site ) => {
			const sitePlugin = getSitePlugin( site );
			return sitePlugin?.update?.new_version;
		} )
		.filter( ( version ) => version );

	const currentVersions = sites
		.map( ( site ) => {
			const sitePlugin = getSitePlugin( site );
			return sitePlugin?.version;
		} )
		.filter( ( version ) => version );

	return useMemo( () => {
		const versions = [
			// We want to remove the duplicated versions in the array, because if multiple sites have
			// the same plugin version, we don't want to display the range.
			...new Set(
				// Sort the plugin versions, respecting semantic version convention.
				currentVersions.sort( ( a: string, b: string ): number =>
					a.localeCompare( b, undefined, {
						numeric: true,
						sensitivity: 'case',
						caseFirst: 'upper',
					} )
				)
			),
		];

		return {
			currentVersionsRange: {
				min: versions[ 0 ],
				max: versions.length > 1 ? versions[ versions.length - 1 ] : null,
			},
			updatedVersions,
			hasUpdate,
			updateableSites,
		};
	}, [ currentVersions, hasUpdate, updateableSites, updatedVersions ] );
}
