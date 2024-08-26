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
	siteCount?: number;
} {
	const allSites = useSelector( getSites );

	// if ( plugin.name !== 'Akismet Anti-spam: Spam Protection' ) {
	// 	return {
	// 		currentVersionsRange: {
	// 			min: '1',
	// 			max: '2',
	// 		},
	// 		updatedVersions: [ '3' ],
	// 		hasUpdate: false,
	// 	};
	// }
	// console.log( 'plugin', plugin );

	// let minVersion = '100.1.1';
	// let maxVersion = '0.0.0';
	// let updateVersion = '0';
	// let siteCount = 0;

	// function getNumberValue( version: string ) {
	// 	const [ major, minor, patch ] = version.split( '.' ).map( ( v ) => parseInt( v ) );
	// 	return major * 1000000 + minor * 100 + patch;
	// }

	// console.log( 'plugin.sites: ', plugin.sites );
	// console.log( 'allSites: ', allSites );

	// for ( const siteId in plugin.sites ) {
	// 	if ( getNumberValue( plugin.sites[ siteId ].version ) < getNumberValue( minVersion ) ) {
	// 		minVersion = plugin.sites[ siteId ].version;
	// 	}

	// 	if ( getNumberValue( plugin.sites[ siteId ].version ) >= getNumberValue( maxVersion ) ) {
	// 		maxVersion = plugin.sites[ siteId ].version;
	// 	}

	// 	if ( plugin.sites[ siteId ].update ) {
	// 		const canUpdateFiles = allSites.find( ( s ) => s?.ID === parseInt( siteId ) )?.canUpdateFiles;

	// 		if ( canUpdateFiles ) {
	// 			updateVersion = plugin.sites[ siteId ].update.new_version;
	// 			siteCount++;
	// 		}
	// 	}
	// }

	// return {
	// 	currentVersionsRange: {
	// 		min: minVersion,
	// 		max: minVersion === maxVersion ? '' : maxVersion,
	// 	},
	// 	updatedVersions: [ updateVersion ],
	// 	hasUpdate: updateVersion !== '0',
	// 	siteCount,
	// };

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

	const pluginsOnSites2: any = useSelector( ( state ) =>
		getPluginOnSites( state, siteIds, plugin?.slug )
	);

	const pluginsOnSites = plugin;

	// console.log( 'pluginsOnSites ', pluginsOnSites );
	// console.log( 'pluginsOnSites2 ', pluginsOnSites2 );

	const getSitePlugin = ( site: SiteDetails ) => {
		const siteId = selectedSiteId || site.ID;
		return pluginsOnSites?.sites[ siteId ];
	};

	const hasUpdate = sites.some( ( site ) => {
		const sitePlugin = getSitePlugin( site );
		return sitePlugin?.update?.new_version && site.canUpdateFiles;
	} );

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
		};
	}, [ currentVersions, hasUpdate, updatedVersions ] );
}
