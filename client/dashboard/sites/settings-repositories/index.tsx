import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery, codeDeploymentsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalText as Text, Button } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { siteRoute } from '../../app/router/sites';
import { Callout } from '../../components/callout';
import { CalloutOverlay } from '../../components/callout-overlay';
import { DataViewsCard } from '../../components/dataviews-card';
import PageLayout from '../../components/page-layout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { hasHostingFeature } from '../../utils/site-features';
import illustrationUrl from '../deployments/deployments-callout-illustration.svg';
import ghIconUrl from '../deployments/gh-icon.svg';
import SettingsPageHeader from '../settings-page-header';
import { useRepositoryFields } from './dataviews/fields';
import { DEFAULT_VIEW, DEFAULT_LAYOUTS } from './dataviews/views';
import type { View } from '@wordpress/dataviews';

export function SiteRepositoriesCallout( {
	siteSlug,
	titleAs = 'h1',
}: {
	siteSlug: string;
	titleAs?: React.ElementType | keyof JSX.IntrinsicElements;
} ) {
	return (
		<Callout
			icon={ <img src={ ghIconUrl } alt={ __( 'GitHub logo' ) } /> }
			title={ __( 'Deploy from GitHub' ) }
			titleAs={ titleAs }
			image={ illustrationUrl }
			description={
				<>
					<Text as="p" variant="muted">
						{ __(
							'Connect your GitHub repo directly to your WordPress.com site—with seamless integration, straightforward version control, and automated workflows.'
						) }
					</Text>
					<Text as="p" variant="muted">
						{ __( 'Available on the WordPress.com Business and Commerce plans.' ) }
					</Text>
				</>
			}
			actions={
				<UpsellCTAButton
					text={ __( 'Upgrade plan' ) }
					tracksId="deployments"
					variant="primary"
					href={ `/checkout/${ siteSlug }/business` }
				/>
			}
		/>
	);
}

function RepositoriesList() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	const { data: deployments = [], isLoading } = useQuery( {
		...codeDeploymentsQuery( site?.ID || 0 ),
		enabled: !! site?.ID,
	} );

	const fields = useRepositoryFields();
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( deployments, view, fields );

	const hasFilterOrSearch = ( view.filters && view.filters.length > 0 ) || view.search;
	const emptyTitle = hasFilterOrSearch
		? __( 'No repositories found' )
		: __( 'No repositories connected' );

	return (
		<DataViewsCard>
			<DataViews
				data={ filteredData }
				fields={ fields }
				view={ view }
				onChangeView={ setView }
				isLoading={ isLoading }
				defaultLayouts={ DEFAULT_LAYOUTS }
				paginationInfo={ paginationInfo }
				getItemId={ ( item ) => item.repository_name }
				empty={ emptyTitle }
			/>
		</DataViewsCard>
	);
}

function SiteRepositories() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );

	if ( ! site ) {
		return;
	}

	const hasDeploymentFeature = hasHostingFeature( site, HostingFeatures.DEPLOYMENT );

	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
					title={ __( 'Repositories' ) }
					description={ __( 'Connect repositories to your WordPress site.' ) }
					actions={
						<Button variant="primary" __next40pxDefaultSize>
							{ __( 'Connect repository' ) }
						</Button>
					}
				/>
			}
		>
			<CalloutOverlay
				showCallout={ ! hasDeploymentFeature }
				callout={ <SiteRepositoriesCallout siteSlug={ site.slug } /> }
				main={ <RepositoriesList /> }
			/>
		</PageLayout>
	);
}

export default SiteRepositories;
