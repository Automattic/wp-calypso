import {
	siteBySlugQuery,
	codeDeploymentsQuery,
	codeDeploymentRunsQuery,
} from '@automattic/api-queries';
import { useSuspenseQuery, useQuery, useQueries } from '@tanstack/react-query';
import { Button, Modal } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { Icon, seen } from '@wordpress/icons';
import { useState, useMemo } from 'react';
import { siteRoute, siteSettingsRepositoriesRoute } from '../../app/router/sites';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { useDeploymentFields } from './dataviews/fields';
import { DEFAULT_VIEW, DEFAULT_LAYOUTS } from './dataviews/views';
import { DeploymentLogsModalContent } from './deployment-logs/deployment-logs-modal-content';
import { TriggerDeploymentModalForm } from './trigger-deployment-modal-form';
import type {
	DeploymentRun,
	DeploymentRunWithDeploymentInfo,
	CodeDeploymentData,
} from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

function DeploymentsList() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const [ isModalTriggerDeploymentOpen, setIsModalTriggerDeploymentOpen ] = useState( false );
	const closeModalTriggerDeployment = () => setIsModalTriggerDeploymentOpen( false );
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );
	const { data: deployments = [], isLoading: isLoadingDeployments } = useQuery(
		codeDeploymentsQuery( site.ID )
	);

	// Fetch all deployment runs in parallel
	const deploymentRunsQueries = useQueries( {
		queries: deployments.map( ( deployment: CodeDeploymentData ) => ( {
			...codeDeploymentRunsQuery( site.ID, deployment.id ),
			refetchInterval: 5000,
			meta: {
				persist: false,
			},
		} ) ),
	} );

	// Transform the data to include deployment info and mark active deployments
	const deploymentRuns: DeploymentRunWithDeploymentInfo[] = useMemo( () => {
		const allRuns: DeploymentRunWithDeploymentInfo[] = [];

		deploymentRunsQueries.forEach( ( query, index ) => {
			const deployment = deployments[ index ];
			if ( query.data && deployment ) {
				const runsWithInfo = query.data.map( ( run: DeploymentRun ) => {
					const isActiveDeployment =
						deployment.current_deployment_run?.id === run.id ||
						( ! deployment.current_deployment_run &&
							deployment.current_deployed_run?.id === run.id );

					return {
						...run,
						repository_name: deployment.repository_name,
						branch_name: deployment.branch_name,
						is_automated: deployment.is_automated,
						is_active_deployment: isActiveDeployment,
					};
				} );
				allRuns.push( ...runsWithInfo );
			}
		} );

		return allRuns;
	}, [ deployments, deploymentRunsQueries ] );

	const isLoading =
		isLoadingDeployments || deploymentRunsQueries.some( ( query ) => query.isLoading );

	const repositoryOptions = useMemo( () => {
		return Array.from( new Set( deploymentRuns.map( ( item ) => item.repository_name ) ) )
			.sort()
			.map( ( repo ) => ( {
				value: repo,
				label: repo.split( '/' )[ 1 ] || repo,
			} ) );
	}, [ deploymentRuns ] );

	const userNameOptions = useMemo( () => {
		return Array.from(
			new Set(
				deploymentRuns.map( ( item ) => item.metadata?.author?.name ).filter( Boolean ) as string[]
			)
		)
			.sort()
			.map( ( name ) => ( {
				value: name,
				label: name,
			} ) );
	}, [ deploymentRuns ] );

	const fields = useDeploymentFields( {
		repositoryOptions,
		userNameOptions,
	} );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate(
		deploymentRuns,
		view,
		fields
	);

	const getTriggerDeploymentTitle = () => {
		if ( isLoadingDeployments ) {
			return __( 'Loading repositories…' );
		} else if ( ! deployments.length ) {
			return __( 'No connected repositories' );
		}
	};

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Deployments' ) }
					actions={
						<>
							<RouterLinkButton
								to={ siteSettingsRepositoriesRoute.fullPath }
								params={ { siteSlug } }
								variant="secondary"
								__next40pxDefaultSize
							>
								{ __( 'Manage repositories' ) }
							</RouterLinkButton>
							<Button
								variant="primary"
								__next40pxDefaultSize
								onClick={ () => {
									setIsModalTriggerDeploymentOpen( true );
								} }
								disabled={ isLoadingDeployments || ! deployments.length }
								title={ getTriggerDeploymentTitle() }
							>
								{ __( 'Trigger deployment' ) }
							</Button>
						</>
					}
				/>
			}
		>
			<DataViewsCard>
				<DataViews
					actions={ [
						{
							id: 'open-logs',
							label: __( 'Open logs' ),
							isPrimary: true,
							icon: <Icon icon={ seen } />,
							RenderModal: ( { items, closeModal } ) => (
								<DeploymentLogsModalContent
									onRequestClose={ () => {
										closeModal?.();
									} }
									deployment={ items[ 0 ] }
									siteId={ site.ID }
								/>
							),
							hideModalHeader: true,
							modalSize: 'large',
						},
					] }
					data={ filteredData }
					fields={ fields }
					view={ view }
					onChangeView={ setView }
					isLoading={ isLoading }
					defaultLayouts={ DEFAULT_LAYOUTS }
					paginationInfo={ paginationInfo }
					getItemId={ ( item ) => item.id.toString() }
					empty={
						<p>
							{ ( view.filters && view.filters.length > 0 ) || view.search
								? __( 'No deployments found' )
								: __( 'No deployments yet' ) }
						</p>
					}
				/>
			</DataViewsCard>

			{ isModalTriggerDeploymentOpen && (
				<Modal
					title={ __( 'Trigger manual deploy' ) }
					onRequestClose={ closeModalTriggerDeployment }
					size="medium"
				>
					<TriggerDeploymentModalForm
						deployments={ deployments }
						onClose={ closeModalTriggerDeployment }
					/>
				</Modal>
			) }
		</PageLayout>
	);
}

export default DeploymentsList;
