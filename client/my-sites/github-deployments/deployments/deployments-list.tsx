import { useFuzzySearch } from '@automattic/search';
import { useState } from 'react';
import { SortDirection, useSort } from '../components/sort-button/use-sort';
import { SearchDeployments } from './deployments-list-search';
import { DeploymentsListTable } from './deployments-list-table';
import { NoResults } from './no-results';
import { CodeDeploymentData } from './use-code-deployments-query';

import './styles.scss';
interface GitHubDeploymentsListProps {
	deployments: CodeDeploymentData[];
}

function applySort( deployments: CodeDeploymentData[], key: string, direction: SortDirection ) {
	switch ( key ) {
		case 'name':
			if ( direction === 'asc' ) {
				return deployments.sort( ( left, right ) => {
					return left.repository_name.localeCompare( right.repository_name );
				} );
			}
			return deployments.sort( ( left, right ) => {
				return left.repository_name.localeCompare( right.repository_name ) * -1;
			} );

		case 'date':
			if ( direction === 'asc' ) {
				return deployments.sort( ( left, right ) => {
					return left.updated_on.localeCompare( right.updated_on );
				} );
			}
			return deployments.sort( ( left, right ) => {
				return left.updated_on.localeCompare( right.updated_on ) * -1;
			} );

		case 'status':
			if ( direction === 'asc' ) {
				return deployments.sort( ( left, right ) => {
					const leftRun = left.current_deployment_run;
					const rightRun = right.current_deployment_run;
					if ( leftRun && rightRun ) {
						return leftRun?.status.localeCompare( rightRun.status );
					} else if ( leftRun ) {
						return 1;
					}
					return -1;
				} );
			}
			return deployments.sort( ( left, right ) => {
				const leftRun = left.current_deployment_run;
				const rightRun = right.current_deployment_run;
				if ( leftRun && rightRun ) {
					return leftRun?.status.localeCompare( rightRun.status );
				} else if ( leftRun ) {
					return -1;
				}
				return 1;
			} );

		default:
			return deployments;
	}
}

export const GitHubDeploymentsList = ( { deployments }: GitHubDeploymentsListProps ) => {
	const { key, direction, handleSortChange } = useSort( 'name' );
	const [ query, setQuery ] = useState( '' );

	const filteredDeployments = useFuzzySearch( {
		data: deployments,
		keys: [ 'repository_name' ],
		query,
	} );

	const getContent = () => {
		if ( filteredDeployments.length === 0 ) {
			return <NoResults />;
		}

		return (
			<DeploymentsListTable
				deployments={ applySort( filteredDeployments, key, direction ) }
				sortKey={ key }
				sortDirection={ direction }
				onSortChange={ handleSortChange }
			/>
		);
	};

	return (
		<div className="github-deployments-list">
			<div className="github-deployments-list__header">
				<SearchDeployments value={ query } onChange={ setQuery } />
			</div>
			<div className="github-deployments__body">{ getContent() }</div>
		</div>
	);
};
