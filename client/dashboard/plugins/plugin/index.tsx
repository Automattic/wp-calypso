import { Site } from '@automattic/api-core';
import { wpOrgPluginQuery, pluginsQuery, sitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import { pluginRoute } from '../../app/router/plugins';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';
import { TextBlur } from '../../components/text-blur';
import { SitesWithThisPlugin } from './sites-with-this-plugin';
import { SitesWithoutThisPlugin } from './sites-without-this-plugin';

export default function Plugin() {
	const { pluginId } = pluginRoute.useParams();
	const locale = useLocale();
	const { data: sitesPlugins, isLoading: isLoadingSitesPlugins } = useQuery( pluginsQuery() );
	const { data: sites, isLoading: isLoadingSites } = useQuery( sitesQuery() );
	const { data: wpOrgPlugin, isLoading: isLoadingWpOrgPlugin } = useQuery(
		wpOrgPluginQuery( pluginId, locale )
	);

	const siteIdsWithThisPlugin = sitesPlugins?.sites
		? Object.entries( sitesPlugins.sites ).flatMap( ( [ siteId, plugins ] ) =>
				plugins.some( ( p ) => p.slug === pluginId ) ? [ siteId ] : []
		  )
		: [];

	const [ sitesWithThisPlugin, sitesWithoutThisPlugin ] = sites
		? sites.reduce(
				( acc, site ) => {
					if ( siteIdsWithThisPlugin.includes( String( site.ID ) ) ) {
						acc[ 0 ].push( site );
					} else {
						acc[ 1 ].push( site );
					}
					return acc;
				},
				[ [], [] ] as [ Site[], Site[] ]
		  )
		: [ [], [] ];

	if ( ! isLoadingSitesPlugins && ! isLoadingSites && ! isLoadingWpOrgPlugin && ! wpOrgPlugin ) {
		return (
			<PageLayout size="large" header={ <PageHeader title={ __( 'Plugin Not Found' ) } /> }>
				<div>{ __( 'Plugin not found' ) }</div>
			</PageLayout>
		);
	}

	return (
		<PageLayout
			size="large"
			header={
				<VStack spacing={ 2 }>
					<Text as="p" variant="muted">
						{ __( 'Manage plugins' ) }
					</Text>

					<PageHeader
						title={
							wpOrgPlugin ? (
								// @ts-expect-error: Can only set one of `children` or `props.dangerouslySetInnerHTML`.
								<Text dangerouslySetInnerHTML={ { __html: wpOrgPlugin.name } } />
							) : (
								<TextBlur>{ pluginId }</TextBlur>
							)
						}
					/>
				</VStack>
			}
		>
			<VStack spacing={ 20 }>
				<VStack spacing={ 6 }>
					<SectionHeader
						title={ sprintf(
							// translators: %(count) is the number of sites the plugin is installed on.
							_n(
								'Installed on %(count)d site',
								'Installed on %(count)d sites',
								siteIdsWithThisPlugin.length
							),
							{ count: siteIdsWithThisPlugin.length }
						) }
					/>

					<DataViewsCard>
						<SitesWithThisPlugin sites={ sitesWithThisPlugin } />
					</DataViewsCard>
				</VStack>

				<VStack spacing={ 6 }>
					<SectionHeader title={ __( 'Available on' ) } />

					<DataViewsCard>
						<SitesWithoutThisPlugin sites={ sitesWithoutThisPlugin } />
					</DataViewsCard>
				</VStack>
			</VStack>
		</PageLayout>
	);
}
