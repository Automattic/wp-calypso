import { CodeDeploymentData, HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery, codeDeploymentsQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Button, __experimentalText as Text } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { useState } from 'react';
import { siteRoute, siteDeploymentsListRoute } from '../../app/router/sites';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import illustrationUrl from '../deployments/deployments-callout-illustration.svg';
import ghIconUrl from '../deployments/gh-icon.svg';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { useRepositoryFields } from './dataviews/fields';
import { DEFAULT_VIEW, DEFAULT_LAYOUTS } from './dataviews/views';
import { DisconnectRepositoryModalContent } from './disconnect-repository-modal-content';
import type { RenderModalProps, View } from '@wordpress/dataviews';

function RepositoriesList() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	const { data: deployments = [], isLoading } = useQuery( codeDeploymentsQuery( site.ID ) );

	const fields = useRepositoryFields();
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( deployments, view, fields );

	const actions = [
		{
			id: 'delete',
			label: __( 'Disconnect repository' ),
			RenderModal: ( { items, closeModal }: RenderModalProps< CodeDeploymentData > ) => {
				return (
					<DisconnectRepositoryModalContent deployment={ items[ 0 ] } onClose={ closeModal } />
				);
			},
		},
	];

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
				actions={ actions }
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

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Repositories' ) }
					description={ __( 'Connect repositories to your WordPress site.' ) }
					prefix={
						<RouterLinkButton
							className="dashboard-page-header__back-button"
							icon={ isRTL() ? chevronRight : chevronLeft }
							to={ siteDeploymentsListRoute.fullPath }
						>
							{ __( 'Deployments' ) }
						</RouterLinkButton>
					}
					actions={
						<Button variant="primary" __next40pxDefaultSize>
							{ __( 'Connect repository' ) }
						</Button>
					}
				/>
			}
		>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.DEPLOYMENT }
				tracksFeatureId="settings-repositories"
				upsellIcon={ <img src={ ghIconUrl } alt={ __( 'GitHub logo' ) } /> }
				upsellImage={ illustrationUrl }
				upsellTitle={ __( 'Deploy from GitHub' ) }
				upsellDescription={
					<>
						<Text as="p" variant="muted">
							{ __(
								'Connect your GitHub repo directly to your WordPress.com site—with seamless integration, straightforward version control, and automated workflows.'
							) }
						</Text>
					</>
				}
			>
				<RepositoriesList />
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}

export default SiteRepositories;
