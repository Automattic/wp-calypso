import { useMemo } from 'react';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { useSelector } from 'calypso/state';
import { getPluginOnSites } from 'calypso/state/plugins/installed/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import type { PluginComponentProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

export default function usePluginVersionInfo(
	plugin: PluginComponentProps,
	selectedSite?: SiteDetails
) {
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
	const state = useSelector( ( state ) => state );
	const pluginsOnSites: any = getPluginOnSites( state, siteIds, plugin?.slug );

	const hasUpdate = sites.some( ( site ) => {
		const siteId = selectedSite ? selectedSite.ID : site.ID;
		const sitePlugin = pluginsOnSites?.sites[ siteId ];
		return sitePlugin?.update?.new_version && site.canUpdateFiles;
	} );

	const updatedVersions = sites
		.map( ( site ) => {
			const siteId = selectedSite ? selectedSite.ID : site.ID;
			const sitePlugin = pluginsOnSites?.sites[ siteId ];
			return sitePlugin?.update?.new_version;
		} )
		.filter( ( version ) => version );

	const currentVersions = sites
		.map( ( site ) => {
			const siteId = selectedSite ? selectedSite.ID : site.ID;
			const sitePlugin = pluginsOnSites?.sites[ siteId ];
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
		};
	}, [ currentVersions, hasUpdate, updatedVersions ] );
}
