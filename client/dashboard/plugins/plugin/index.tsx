import { __experimentalVStack as VStack } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { pluginRoute } from '../../app/router/plugins';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';
import { TextBlur } from '../../components/text-blur';
import { SitesWithThisPlugin } from './sites-with-this-plugin';
import { SitesWithoutThisPlugin } from './sites-without-this-plugin';
import { usePlugin } from './use-plugin';

export default function Plugin() {
	const { pluginId: pluginSlug } = pluginRoute.useParams();
	const { isLoading, sitesWithThisPlugin, plugin } = usePlugin( pluginSlug );

	if ( ! isLoading && ! plugin ) {
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
							plugin ? (
								// @ts-expect-error: Can only set one of `children` or `props.dangerouslySetInnerHTML`.
								<Text dangerouslySetInnerHTML={ { __html: plugin.name } } />
							) : (
								<TextBlur>{ pluginSlug }</TextBlur>
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
								sitesWithThisPlugin.length
							),
							{ count: sitesWithThisPlugin.length }
						) }
					/>

					<DataViewsCard>
						<SitesWithThisPlugin pluginSlug={ pluginSlug } />
					</DataViewsCard>
				</VStack>

				<VStack spacing={ 6 }>
					<SectionHeader title={ __( 'Available on' ) } />

					<DataViewsCard>
						<SitesWithoutThisPlugin pluginSlug={ pluginSlug } />
					</DataViewsCard>
				</VStack>
			</VStack>
		</PageLayout>
	);
}
