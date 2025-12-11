import { type PluginItem, Site } from '@automattic/api-core';
import { __experimentalVStack as VStack, privateApis } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { useMemo, useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { pluginRoute } from '../../app/router/plugins';
import { DataViewsCard } from '../../components/dataviews';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';
import { TextBlur } from '../../components/text-blur';
import { SitesWithThisPlugin } from './sites-with-this-plugin';
import { SitesWithoutThisPlugin } from './sites-without-this-plugin';
import { SiteWithPluginData, usePlugin } from './use-plugin';

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
	plugin: PluginItem | undefined;
	pluginName?: string;
	pluginBySiteId: Map< number, PluginItem >;
};

function PluginTabs( {
	pluginSlug,
	isLoading,
	sitesWithThisPlugin,
	sitesWithoutThisPlugin,
	plugin,
	pluginName,
	pluginBySiteId,
}: PluginTabsProps ) {
	const [ activeTab, setActiveTab ] = useState< 'installed' | 'available' >( 'installed' );

	return (
		<VStack spacing={ 6 }>
			<Tabs
				selectedTabId={ activeTab }
				onSelect={ ( tabId: 'installed' | 'available' ) => setActiveTab( tabId ) }
			>
				<Tabs.TabList>
					<Tabs.Tab tabId="installed">
						<SectionHeader
							level={ 3 }
							title={ sprintf(
								// translators: %(count) is the number of sites the plugin is installed on.
								_n(
									'Installed on %(count)d site',
									'Installed on %(count)d sites',
									sitesWithThisPlugin.length
								),
								{ count: sitesWithThisPlugin.length }
							) }
						/>
					</Tabs.Tab>
					<Tabs.Tab tabId="available">
						<SectionHeader level={ 3 } title={ __( 'Available on' ) } />
					</Tabs.Tab>
				</Tabs.TabList>

				<Tabs.TabPanel tabId="installed">
					<VStack spacing={ 6 }>
						<DataViewsCard>
							<SitesWithThisPlugin
								pluginSlug={ pluginSlug }
								isLoading={ isLoading }
								plugin={ plugin }
								pluginBySiteId={ pluginBySiteId }
								sitesWithThisPlugin={ sitesWithThisPlugin }
							/>
						</DataViewsCard>
					</VStack>
				</Tabs.TabPanel>

				<Tabs.TabPanel tabId="available">
					<VStack spacing={ 6 }>
						<DataViewsCard>
							<SitesWithoutThisPlugin
								pluginSlug={ pluginSlug }
								pluginName={ pluginName }
								isLoading={ isLoading }
								sitesWithoutThisPlugin={ sitesWithoutThisPlugin }
							/>
						</DataViewsCard>
					</VStack>
				</Tabs.TabPanel>
			</Tabs>
		</VStack>
	);
}

export default function Plugin() {
	const { pluginId: pluginSlug } = pluginRoute.useParams();
	const { icon, isLoading, plugin, pluginBySiteId, sitesWithThisPlugin, sitesWithoutThisPlugin } =
		usePlugin( pluginSlug );

	const decoration = useMemo( () => {
		if ( icon ) {
			return <img src={ icon } alt={ plugin?.name } />;
		} else if ( isLoading ) {
			return <div className="plugin-icon-placeholder" aria-hidden="true" />;
		}
	}, [ icon, isLoading, plugin?.name ] );

	if ( ! isLoading && ! plugin ) {
		return (
			<PageLayout
				size="large"
				header={
					<PageHeader prefix={ <Breadcrumbs length={ 2 } /> } title={ __( 'Plugin not found' ) } />
				}
			/>
		);
	}

	return (
		<PageLayout
			size="large"
			header={
				<VStack spacing={ 2 }>
					<PageHeader
						prefix={ <Breadcrumbs length={ 2 } /> }
						decoration={ decoration }
						title={
							plugin ? (
								// @ts-expect-error: Can only set one of `children` or `props.dangerouslySetInnerHTML`.
								<Text dangerouslySetInnerHTML={ { __html: plugin.name } } />
							) : (
								<TextBlur>{ pluginSlug }</TextBlur>
							)
						}
						description={ __( 'View plugin details and manage installation across your sites.' ) }
					/>
				</VStack>
			}
		>
			<PluginTabs
				pluginSlug={ pluginSlug }
				isLoading={ isLoading }
				plugin={ plugin }
				pluginName={ plugin?.name }
				pluginBySiteId={ pluginBySiteId }
				sitesWithThisPlugin={ sitesWithThisPlugin }
				sitesWithoutThisPlugin={ sitesWithoutThisPlugin }
			/>
		</PageLayout>
	);
}
