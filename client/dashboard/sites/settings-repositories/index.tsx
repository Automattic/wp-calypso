import { CodeDeploymentData, HostingFeatures } from '@automattic/api-core';
import {
	siteBySlugQuery,
	codeDeploymentsQuery,
	githubInstallationsQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useRouter, useSearch } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { DataViews, DataViewsCard, DataViewsEmptyStateLayout } from '../../components/dataviews';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { ThemedIllustration } from '../../components/themed-illustration';
import { hasHostingFeature } from '../../utils/site-features';
import illustrationDarkUrl from '../deployments/deployments-callout-illustration-dark.svg';
import illustrationUrl from '../deployments/deployments-callout-illustration.svg';
import GithubIcon from '../deployments/icons/github';
import { TriggerDeploymentModalForm } from '../deployments-list/trigger-deployment-modal-form';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { useRepositoryFields } from './dataviews/fields';
import { DEFAULT_VIEW, DEFAULT_LAYOUTS } from './dataviews/views';
import { DisconnectRepositoryModalContent } from './disconnect-repository-modal-content';
import { useInstallGithub } from './use-install-github';
import type { RenderModalProps, Action } from '@wordpress/dataviews';

function RepositoriesList() {
	const router = useRouter();
	const { siteSlug } = useParams( { strict: false } ) as { siteSlug: string };
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const {
		error: githubInstallationsError,
		isLoading: isLoadingInstallations,
		refetch: refetchGithubInstallations,
	} = useQuery( githubInstallationsQuery() );
	const { installGithub } = useInstallGithub();

	const searchParams = useSearch( { strict: false } );
	const { view, updateView, resetView } = usePersistentView( {
		slug: 'site-settings-repositories',
		defaultView: DEFAULT_VIEW,
		queryParams: searchParams,
	} );

	const {
		data: deployments = [],
		isLoading: isLoadingDeployments,
		isSuccess: hasLoadedDeployments,
	} = useQuery( codeDeploymentsQuery( site.ID ) );

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
						isStagingSite={ site.is_wpcom_staging_site }
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
					to: `/sites/${ siteSlug }/settings/repositories/manage/${ items[ 0 ].id }`,
				} );
			},
		},
		{
			id: 'view-deployment-runs',
			label: __( 'View deployment runs' ),
			callback: ( items ) => {
				const repositoryName = items[ 0 ]?.repository_name;
				router.navigate( {
					to: `/sites/${ siteSlug }/deployments`,
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

	const isLoading = isLoadingDeployments || isLoadingInstallations;

	if ( ! isLoading && hasLoadedDeployments && deployments.length === 0 ) {
		return (
			<DataViewsEmptyStateLayout
				isCompact
				title={ __( 'Deploy your code from GitHub' ) }
				description={ __( 'Connect a repository to deploy automatically or manually.' ) }
			/>
		);
	}

	// The installations request fails when the WordPress.com app is not installed
	// on the user's GitHub account. Repositories connected by someone else, or
	// before the app was removed, can't be listed until it is installed again.
	if ( ! isLoading && githubInstallationsError ) {
		return (
			<DataViewsEmptyStateLayout
				isCompact
				title={ __( 'Install the WordPress.com app on GitHub' ) }
				description={ __( 'This site’s repositories will appear here once the app is installed.' ) }
			>
				<Button
					variant="secondary"
					__next40pxDefaultSize
					onClick={ () => installGithub( { onSuccess: () => refetchGithubInstallations() } ) }
				>
					{ __( 'Install the WordPress.com app' ) }
				</Button>
			</DataViewsEmptyStateLayout>
		);
	}

	return (
		<DataViewsCard>
			<DataViews
				data={ isLoadingInstallations ? [] : filteredData }
				fields={ fields }
				view={ view }
				onChangeView={ updateView }
				onReset={ resetView }
				actions={ actions }
				isLoading={ isLoading }
				defaultLayouts={ DEFAULT_LAYOUTS }
				paginationInfo={ paginationInfo }
				getItemId={ ( item ) => item.id.toString() }
				empty={
					view.search ? (
						<DataViewsEmptyStateLayout
							isBorderless
							isCompact
							title={ __( 'No repositories match your search' ) }
							description={ __( 'Try a different search term.' ) }
						/>
					) : (
						<p>{ __( 'No repositories connected' ) }</p>
					)
				}
				onChangeSelection={ ( selection ) => {
					if ( selection.length > 0 ) {
						const item = filteredData.find( ( d ) => d.id.toString() === selection[ 0 ] );
						if ( item ) {
							router.navigate( {
								to: `/sites/${ siteSlug }/settings/repositories/manage/${ item.id }`,
							} );
						}
					}
				} }
			/>
		</DataViewsCard>
	);
}

function SiteRepositories() {
	const { siteSlug } = useParams( { strict: false } ) as { siteSlug: string };
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const navigate = useNavigate();
	const canConnect = hasHostingFeature( site, HostingFeatures.DEPLOYMENT );

	const handleConnectRepository = () => {
		navigate( { to: `/sites/${ siteSlug }/settings/repositories/connect` } );
	};

	return (
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
				upsellImage={
					<ThemedIllustration light={ illustrationUrl } dark={ illustrationDarkUrl } />
				}
				upsellTitle={ __( 'Deploy from GitHub' ) }
				upsellDescription={ __(
					'Connect your GitHub repo directly to your WordPress.com site—with seamless integration, straightforward version control, and automated workflows.'
				) }
			>
				<RepositoriesList />
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}

export default SiteRepositories;
