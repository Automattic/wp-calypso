import classNames from 'classnames';
import { compact } from 'lodash';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import SectionHeader from 'calypso/components/section-header';
import PluginSite from 'calypso/my-sites/plugins/plugin-site/plugin-site';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import {
	getPluginOnSites,
	getSiteObjectsWithPlugin,
} from 'calypso/state/plugins/installed/selectors';
import getNetworkSites from 'calypso/state/selectors/get-network-sites';
import isConnectedSecondaryNetworkSite from 'calypso/state/selectors/is-connected-secondary-network-site';

import './style.scss';

export function PluginSiteList( props ) {
	const siteIds = siteObjectsToSiteIds( props.sites );
	const sitesWithPlugin = useSelector( ( state ) =>
		getSiteObjectsWithPlugin( state, siteIds, props.plugin.slug )
	);
	const sitesWithSecondarySites = useSelector( ( state ) =>
		getSitesWithSecondarySites( state, props.sites )
	);
	const pluginsOnSites = useSelector( ( state ) =>
		getPluginOnSites( state, siteIds, props.plugin.slug )
	);

	const getSecondaryPluginSites = useCallback(
		( site, secondarySites ) => {
			const pluginsOnSite = pluginsOnSites?.sites[ site.ID ];
			const secondarySitesWithPlugin = sitesWithPlugin.filter(
				( siteWithPlugin ) =>
					secondarySites && secondarySites.some( ( secSite ) => secSite.ID === siteWithPlugin.ID )
			);
			const secondaryPluginSites = pluginsOnSite ? secondarySitesWithPlugin : secondarySites;

			return compact( secondaryPluginSites );
		},
		[ pluginsOnSites, sitesWithPlugin ]
	);

	if ( ! props.sites || props.sites.length === 0 ) {
		return null;
	}

	return (
		<div className={ classNames( 'plugin-site-list', props.className ) }>
			<SectionHeader label={ props.title } />
			{ sitesWithSecondarySites.map( ( { site, secondarySites } ) => (
				<PluginSite
					key={ 'pluginSite' + site.ID }
					site={ site }
					secondarySites={ getSecondaryPluginSites( site, secondarySites ) }
					plugin={ props.plugin }
					wporg={ props.wporg }
				/>
			) ) }
		</div>
	);
}

// TODO: make this memoized after sites-list is removed and `sites` comes from Redux
function getSitesWithSecondarySites( state, sites ) {
	return sites
		.filter( ( site ) => ! isConnectedSecondaryNetworkSite( state, site.ID ) )
		.map( ( site ) => ( {
			site,
			secondarySites: getNetworkSites( state, site.ID ),
		} ) );
}

export default PluginSiteList;
