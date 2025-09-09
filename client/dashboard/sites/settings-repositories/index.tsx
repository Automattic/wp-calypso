import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery, codeDeploymentsQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { siteRoute } from '../../app/router/sites';
import { CalloutOverlay } from '../../components/callout-overlay';
import { DataViewsCard } from '../../components/dataviews-card';
import PageLayout from '../../components/page-layout';
import { hasHostingFeature } from '../../utils/site-features';
import { DeploymentCallout } from '../deployment-list/deployment-callout';
import SettingsPageHeader from '../settings-page-header';
import { useRepositoryFields } from './dataviews/fields';
import { DEFAULT_VIEW, DEFAULT_LAYOUTS } from './dataviews/views';
import type { View } from '@wordpress/dataviews';

function RepositoriesList() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	const { data: deployments = [], isLoading } = useQuery( codeDeploymentsQuery( site.ID ) );

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
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

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
				callout={ <DeploymentCallout siteSlug={ site.slug } /> }
				main={ <RepositoriesList /> }
			/>
		</PageLayout>
	);
}

export default SiteRepositories;
