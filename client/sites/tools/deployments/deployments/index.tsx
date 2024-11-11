import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { translate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { HostingCard } from 'calypso/components/hosting-card';
import { useSelector } from 'calypso/state';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { GitHubDeploymentSurvey } from '../components/deployments-survey';
import { GitHubLoadingPlaceholder } from '../components/loading-placeholder';
import { GitHubDeploymentCreationForm } from '../deployment-creation/deployment-creation-form';
import { GitHubDeploymentsList } from './deployments-list';
import { useActions } from './use-actions';
import { useCodeDeploymentsQuery } from './use-code-deployments-query';
import { useFields } from './use-fields';

import './styles.scss';

const defaultLayouts = { table: {} };

export function GitHubDeployments() {
	const siteId = useSelector( getSelectedSiteId );
	const selectedSite = useSelector( getSelectedSite );

	const { data: deployments, isLoading, refetch } = useCodeDeploymentsQuery( siteId );
	const fields = useFields( selectedSite?.slug );
	const actions = useActions( selectedSite?.slug );

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( () => ( {
		...initialDataViewsState,
		perPage: 15,
		search: '',
		// fields: [ 'repository', 'sites', 'update' ],
	} ) );

	const { data, paginationInfo } = useMemo( () => {
		const result = filterSortAndPaginate( deployments, dataViewsState, fields );

		return {
			data: result.data,
			paginationInfo: result.paginationInfo,
		};
	}, [ deployments, dataViewsState, fields ] );

	console.log( 'deployments: ', deployments );

	const renderContent = () => {
		if ( deployments?.length ) {
			return (
				<>
					<GitHubDeploymentsList deployments={ deployments } />
					{ deployments.some( ( deployment ) => deployment.current_deployed_run !== null ) && (
						<GitHubDeploymentSurvey />
					) }
				</>
			);
		}

		if ( isLoading ) {
			return <GitHubLoadingPlaceholder />;
		}

		return (
			<HostingCard>
				<GitHubDeploymentCreationForm onConnected={ refetch } />
			</HostingCard>
		);
	};

	return (
		<DataViews
			data={ data }
			view={ dataViewsState }
			onChangeView={ setDataViewsState }
			fields={ fields }
			search
			searchLabel={ translate( 'Search by repository name …' ) }
			actions={ actions }
			// isLoading={ isLoading }
			paginationInfo={ paginationInfo }
			defaultLayouts={ defaultLayouts }
			// header={ header }
		/>
	);
}
