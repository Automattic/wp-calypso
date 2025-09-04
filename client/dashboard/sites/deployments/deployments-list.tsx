import { siteBySlugQuery, codeDeploymentsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { siteRoute } from '../../app/router/sites';
import { DataViewsCard } from '../../components/dataviews-card';
import { useDeploymentFields } from './dataviews/fields';
import { DEFAULT_VIEW, DEFAULT_LAYOUTS } from './dataviews/views';
import type {
	DeploymentRun,
	DeploymentRunWithDeploymentInfo,
	CodeDeploymentData,
	fetchCodeDeploymentRuns,
} from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

export function DeploymentsList() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	const { data: deployments = [], isLoading: deploymentsLoading } = useQuery( {
		...codeDeploymentsQuery( site?.ID || 0 ),
		enabled: !! site?.ID,
	} );

	const { data: deploymentRuns = [], isLoading: runsLoading } = useQuery<
		DeploymentRunWithDeploymentInfo[]
	>( {
		enabled: !! site?.ID && deployments.length > 0,
		queryKey: [
			'site',
			site?.ID,
			'code-deployments-runs',
			'all-runs',
			deployments.map( ( d: CodeDeploymentData ) => d.id ).sort(),
		],
		queryFn: async (): Promise< DeploymentRunWithDeploymentInfo[] > => {
			const allRunsPromises = deployments.map( async ( deployment: CodeDeploymentData ) => {
				const runs: DeploymentRun[] = await fetchCodeDeploymentRuns( site!.ID, deployment.id );

				return runs.map( ( run ) => {
					// Find the most recent deployment run for this deployment to mark as active
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
			} );

			const allRunsArrays = await Promise.all( allRunsPromises );
			const flattenedRuns = allRunsArrays.flat();

			// Sort by created_on descending (most recent first)
			return flattenedRuns.sort(
				( a, b ) => new Date( b.created_on ).getTime() - new Date( a.created_on ).getTime()
			);
		},
		refetchInterval: ( query ) => {
			const { data } = query.state;
			const hasActiveRuns = data?.some(
				( run ) =>
					run.status === 'pending' ||
					run.status === 'queued' ||
					run.status === 'running' ||
					run.status === 'building' ||
					run.status === 'dispatched'
			);
			return hasActiveRuns ? 5000 : false;
		},
		meta: {
			persist: false,
		},
	} );

	const isLoading = deploymentsLoading || runsLoading;

	const fields = useDeploymentFields();
	const { data: filteredData, paginationInfo } = filterSortAndPaginate(
		deploymentRuns,
		view,
		fields
	);

	const hasFilterOrSearch = ( view.filters && view.filters.length > 0 ) || view.search;
	const emptyTitle = hasFilterOrSearch ? __( 'No deployments found' ) : __( 'No deployments yet' );

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
				getItemId={ ( item ) => item.id.toString() }
				empty={ emptyTitle }
			/>
		</DataViewsCard>
	);
}
