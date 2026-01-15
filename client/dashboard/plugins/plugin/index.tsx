import { MarketplacePlugin, type PluginItem, Site, WpOrgPlugin } from '@automattic/api-core';
import { privateApis } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SectionHeader } from '../../components/section-header';
import { SitesWithThisPlugin } from './sites-with-this-plugin';
import { SitesWithoutThisPlugin } from './sites-without-this-plugin';
import { SiteWithPluginData } from './use-plugin';

import './style.scss';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

const { Tabs } = unlock( privateApis );

type PluginTabsProps = {
	pluginSlug: string;
	isLoading: boolean;
	sitesWithThisPlugin: SiteWithPluginData[];
	sitesWithoutThisPlugin: Site[];
	plugin: PluginItem | MarketplacePlugin | WpOrgPlugin | undefined;
	pluginName?: string;
	pluginBySiteId: Map< number, PluginItem >;
};

export function PluginTabs( {
	pluginSlug,
	isLoading,
	sitesWithThisPlugin,
	sitesWithoutThisPlugin,
	plugin,
	pluginName,
	pluginBySiteId,
}: PluginTabsProps ) {
	const [ activeTab, setActiveTab ] = useState< 'installed' | 'available' >( 'installed' );
	const [ optimisticDelete, setOptimisticDelete ] = useState< Record< number, boolean > >( {} );
	const prevSiteIds = useRef< Set< number > >(
		new Set( sitesWithThisPlugin.map( ( site ) => site.ID ) )
	);

	useEffect( () => {
		const currentSiteIds = new Set( sitesWithThisPlugin.map( ( site ) => site.ID ) );

		const siteIdsChanged =
			currentSiteIds.size !== prevSiteIds.current.size ||
			Array.from( currentSiteIds ).some( ( id ) => ! prevSiteIds.current.has( id ) );

		if ( siteIdsChanged ) {
			setOptimisticDelete( {} );
			prevSiteIds.current = currentSiteIds;
		}
	}, [ sitesWithThisPlugin ] );

	const sitesWithThisPluginExcludingDeleted = useMemo(
		() => sitesWithThisPlugin.filter( ( item ) => ! optimisticDelete[ item.ID ] ),
		[ sitesWithThisPlugin, optimisticDelete ]
	);

	return (
		<Tabs
			selectedTabId={ activeTab }
			onSelect={ ( tabId: 'installed' | 'available' ) => setActiveTab( tabId ) }
		>
			<Tabs.TabList className="plugin-tabs-list">
				<Tabs.Tab tabId="installed">
					<SectionHeader
						level={ 3 }
						title={ sprintf(
							// translators: %(count) is the number of sites the plugin is installed on.
							_n(
								'Installed on %(count)d site',
								'Installed on %(count)d sites',
								sitesWithThisPluginExcludingDeleted.length
							),
							{ count: sitesWithThisPluginExcludingDeleted.length }
						) }
					/>
				</Tabs.Tab>
				<Tabs.Tab tabId="available">
					<SectionHeader level={ 3 } title={ __( 'Available on' ) } />
				</Tabs.Tab>
			</Tabs.TabList>

			<Tabs.TabPanel className="plugin-tabs-panel" tabId="installed">
				<SitesWithThisPlugin
					pluginSlug={ pluginSlug }
					isLoading={ isLoading }
					// plugin will only be MarketplacePlugin | WpOrgPlugin when there are no sites with it installed
					plugin={ plugin as PluginItem | undefined }
					pluginBySiteId={ pluginBySiteId }
					setOptimisticDelete={ setOptimisticDelete }
					sitesWithThisPlugin={ sitesWithThisPluginExcludingDeleted }
				/>
			</Tabs.TabPanel>

			<Tabs.TabPanel className="plugin-tabs-panel" tabId="available">
				<SitesWithoutThisPlugin
					pluginSlug={ pluginSlug }
					pluginName={ pluginName }
					isLoading={ isLoading }
					sitesWithoutThisPlugin={ sitesWithoutThisPlugin }
				/>
			</Tabs.TabPanel>
		</Tabs>
	);
}
