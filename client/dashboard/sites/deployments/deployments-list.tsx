import {
	siteBySlugQuery,
	codeDeploymentsQuery,
	codeDeploymentRunsQuery,
} from '@automattic/api-queries';
import { useQuery, useQueries } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { siteRoute } from '../../app/router/sites';
import { DataViewsCard } from '../../components/dataviews-card';
import { useDeploymentFields } from './dataviews/fields';
import { DEFAULT_VIEW, DEFAULT_LAYOUTS } from './dataviews/views';
import type {
	DeploymentRun,
	DeploymentRunWithDeploymentInfo,
	CodeDeploymentData,
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

	// Fetch all deployment runs in parallel
	const deploymentRunsQueries = useQueries( {
		queries: deployments.map( ( deployment: CodeDeploymentData ) => ( {
			...codeDeploymentRunsQuery( site?.ID || 0, deployment.id ),
			enabled: !! site?.ID,
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
		deploymentsLoading || deploymentRunsQueries.some( ( query ) => query.isLoading );

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

	const fields = useDeploymentFields( { repositoryOptions, userNameOptions } );
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
