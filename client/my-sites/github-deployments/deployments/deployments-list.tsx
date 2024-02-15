import { ComponentProps, useState } from 'react';
import { SearchDeployments } from './deployments-list-search';
import { DeploymentsListTable } from './deployments-list-table';
import { CodeDeploymentData } from './use-code-deployments-query';

import './styles.scss';

interface GitHubDeploymentsListProps {
	deployments: CodeDeploymentData[];
}

type SortKey = ComponentProps< typeof DeploymentsListTable >[ 'sortKey' ];

export const GitHubDeploymentsList = ( { deployments }: GitHubDeploymentsListProps ) => {
	const [ sort, setSort ] = useState< SortKey >( 'name_asc' );
	const [ query, setQuery ] = useState( '' );

	return (
		<div className="github-deployments-list">
			<div className="github-deployments-list__header">
				<SearchDeployments value={ query } onChange={ setQuery } />
			</div>
			<div className="github-deployments__body">
				<DeploymentsListTable
					deployments={ deployments }
					sortKey={ sort }
					onSortChange={ setSort }
				/>
			</div>
		</div>
	);
};
