import { useState } from 'react';
import { DeploymentsList } from 'calypso/my-sites/github-deployments/deployments/deployments-list';
import { SearchDeployments } from 'calypso/my-sites/github-deployments/deployments/search-deployments';
import { CodeDeploymentData } from 'calypso/my-sites/github-deployments/use-code-deployments-query';

import './styles.scss';

interface CodeDeploymentsProps {
	deployments: CodeDeploymentData[];
}

export type SortOption =
	| 'name_asc'
	| 'name_desc'
	| 'date_asc'
	| 'date_desc'
	| 'status_asc'
	| 'status_desc'
	| 'duration_asc'
	| 'duration_desc';

export const CodeDeployments = ( { deployments }: CodeDeploymentsProps ) => {
	const [ sort, setSort ] = useState< SortOption >( 'name_asc' );
	const [ query, setQuery ] = useState( '' );

	return (
		<div className="github-deployments-list">
			<div className="github-deployments-list__header">
				<SearchDeployments value={ query } onChange={ setQuery } />
			</div>
			<div className="github-deployments__body">
				<DeploymentsList deployments={ deployments } sortKey={ sort } onSortChange={ setSort } />
			</div>
		</div>
	);
};
