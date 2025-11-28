import { CodeDeploymentData, HostingFeatures } from '@automattic/api-core';
import {
	siteBySlugQuery,
	codeDeploymentsQuery,
	githubInstallationsQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import {
	siteDeploymentsListRoute,
	siteRoute,
	siteSettingsRepositoriesConnectRoute,
	siteSettingsRepositoriesManageRoute,
	siteSettingsRepositoriesRoute,
} from '../../app/router/sites';
import { DataViewsCard } from '../../components/dataviews';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { hasHostingFeature } from '../../utils/site-features';
import illustrationUrl from '../deployments/deployments-callout-illustration.svg';
import GithubIcon from '../deployments/icons/github';
import { TriggerDeploymentModalForm } from '../deployments-list/trigger-deployment-modal-form';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { BackToDeploymentsButton } from './back-to-deployments-button';
import { useRepositoryFields } from './dataviews/fields';
import { DEFAULT_VIEW, DEFAULT_LAYOUTS } from './dataviews/views';
import { DisconnectRepositoryModalContent } from './disconnect-repository-modal-content';
import type { RenderModalProps, View, Action } from '@wordpress/dataviews';

function RepositoriesList() {
	const router = useRouter();
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { error: githubInstallationsError, isLoading: isLoadingInstallations } = useQuery(
		githubInstallationsQuery()
	);

	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	const { data: deployments = [], isLoading: isLoadingDeployments } = useQuery(
		codeDeploymentsQuery( site.ID )
	);

	const fields = useRepositoryFields();
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( deployments, view, fields );

	const actions: Action< CodeDeploymentData >[] = [
		{
			id: 'trigger-manual-deployment',
			label: __( 'Trigger manual deployment' ),
			RenderModal: ( { items, closeModal }: RenderModalProps< CodeDeploymentData > ) => {
				return (
					<TriggerDeploymentModalForm
						deployments={ deployments }
						repositoryId={ items[ 0 ].id.toString() }
						onClose={ closeModal }
					/>
				);
			},
			modalSize: 'medium',
		},
		{
			id: 'configure-repository',
			label: __( 'Configure repository' ),
			callback: ( items ) => {
				router.navigate( {
					to: siteSettingsRepositoriesManageRoute.fullPath,
					params: {
						siteSlug: siteSlug,
						deploymentId: items[ 0 ].id,
					},
				} );
			},
		},
		{
			id: 'view-deployment-runs',
			label: __( 'View deployment runs' ),
			callback: ( items ) => {
				const repositoryName = items[ 0 ]?.repository_name;
				router.navigate( {
					to: siteDeploymentsListRoute.fullPath,
					params: {
						siteSlug: siteSlug,
					},
					search: repositoryName ? { repository: repositoryName } : undefined,
				} );
			},
		},
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

	let emptyTitle;
	const hasFilterOrSearch = ( view.filters && view.filters.length > 0 ) || view.search;

	if ( githubInstallationsError ) {
		emptyTitle = createInterpolateElement(
			__( 'No repositories available. <a>Check your GitHub connection</a>.' ),
			{
				a: (
					<Button
						variant="link"
						onClick={ () =>
							router.navigate( { to: siteSettingsRepositoriesConnectRoute.fullPath } )
						}
					/>
				),
			}
		);
	} else if ( hasFilterOrSearch ) {
		emptyTitle = __( 'No repositories found' );
	} else {
		emptyTitle = __( 'No repositories connected' );
	}

	return (
		<DataViewsCard>
			<DataViews
				data={ isLoadingInstallations || githubInstallationsError ? [] : filteredData }
				fields={ fields }
				view={ view }
				onChangeView={ setView }
				actions={ actions }
				isLoading={ isLoadingDeployments || isLoadingInstallations }
				defaultLayouts={ DEFAULT_LAYOUTS }
				paginationInfo={ paginationInfo }
				getItemId={ ( item ) => item.id.toString() }
				empty={ <p>{ emptyTitle }</p> }
				onChangeSelection={ ( selection ) => {
					if ( selection.length > 0 ) {
						const item = filteredData.find( ( d ) => d.id.toString() === selection[ 0 ] );
						if ( item ) {
							router.navigate( {
								to: siteSettingsRepositoriesManageRoute.fullPath,
								params: { siteSlug, deploymentId: item.id },
							} );
						}
					}
				} }
			/>
		</DataViewsCard>
	);
}

function SiteRepositories() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const navigate = useNavigate( { from: siteSettingsRepositoriesRoute.fullPath } );
	const canConnect = hasHostingFeature( site, HostingFeatures.DEPLOYMENT );
	const search = siteSettingsRepositoriesRoute.useSearch();
	const showBackToDeployments = search?.back_to === 'deployments';

	const handleConnectRepository = () => {
		navigate( { to: siteSettingsRepositoriesConnectRoute.fullPath } );
	};

	return (
		<>
			<PageLayout
				size="small"
				header={
					<PageHeader
						prefix={ <Breadcrumbs length={ 2 } /> }
						title={ __( 'Repositories' ) }
						description={ __( 'Connect repositories to your WordPress site.' ) }
						actions={
							canConnect && (
								<Button variant="primary" __next40pxDefaultSize onClick={ handleConnectRepository }>
									{ __( 'Connect repository' ) }
								</Button>
							)
						}
					/>
				}
			>
				<HostingFeatureGatedWithCallout
					site={ site }
					feature={ HostingFeatures.DEPLOYMENT }
					upsellId="site-settings-repositories"
					upsellFeatureId="site-deployments"
					upsellIcon={ <GithubIcon aria-label={ __( 'GitHub logo' ) } /> }
					upsellImage={ illustrationUrl }
					upsellTitle={ __( 'Deploy from GitHub' ) }
					upsellDescription={ __(
						'Connect your GitHub repo directly to your WordPress.com site—with seamless integration, straightforward version control, and automated workflows.'
					) }
				>
					<RepositoriesList />
				</HostingFeatureGatedWithCallout>
			</PageLayout>
			{ showBackToDeployments && <BackToDeploymentsButton /> }
		</>
	);
}

export default SiteRepositories;
