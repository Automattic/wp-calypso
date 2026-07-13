import { MarketplacePlugin, type PluginItem, Site, WpOrgPlugin } from '@automattic/api-core';
import { privateApis } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SectionHeader } from '../../components/section-header';
import { TextBlur } from '../../components/text-blur';
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

	const installedCount = sitesWithThisPluginExcludingDeleted.length;
	const installedLabel = sprintf(
		// translators: %(count)d: the number of sites the plugin is installed on.
		_n( 'Installed on %(count)d site', 'Installed on %(count)d sites', installedCount ),
		{ count: installedCount }
	);
	// While the site data is still loading the count isn't known yet, so blur the
	// label into a skeleton instead of asserting a misleading "Installed on 0 sites".
	const installedTabTitle =
		isLoading && installedCount === 0 ? <TextBlur>{ installedLabel }</TextBlur> : installedLabel;

	return (
		<Tabs
			selectedTabId={ activeTab }
			onSelect={ ( tabId: 'installed' | 'available' ) => setActiveTab( tabId ) }
		>
			{ /*
			 * The "Installed on N sites" label changes width when the selected
			 * plugin changes, which shifts the sibling "Available on" tab. The
			 * WordPress Tabs indicator only re-measures on a selected-tab resize
			 * or tab-index change — not when a sibling reflows — so its underline
			 * gets left behind. Keying the tab list on the label remounts it,
			 * forcing a fresh measurement so the indicator stays aligned.
			 */ }
			<Tabs.TabList key={ sitesWithThisPluginExcludingDeleted.length } className="plugin-tabs-list">
				<Tabs.Tab tabId="installed">
					<SectionHeader level={ 3 } title={ installedTabTitle } />
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
