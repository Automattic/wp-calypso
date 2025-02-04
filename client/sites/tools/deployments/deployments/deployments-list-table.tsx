import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { SortButton } from '../components/sort-button/sort-button';
import { SortDirection } from '../components/sort-button/use-sort';
import { CodeDeploymentData } from '../deployments/use-code-deployments-query';
import { DeploymentsListItem } from './deployments-list-item';

interface DeploymentsListProps {
	deployments: CodeDeploymentData[];
	sortKey: string;
	sortDirection: SortDirection;
	onSortChange( sortKey: string ): void;
}

export const DeploymentsListTable = ( {
	deployments,
	sortKey,
	sortDirection,
	onSortChange,
}: DeploymentsListProps ) => {
	const hasRuns = useMemo( () => {
		return !! deployments.find(
			( deployment ) => deployment.current_deployed_run || deployment.current_deployment_run
		);
	}, [ deployments ] );

	return (
		<table>
			<thead>
				<tr>
					<th>
						<SortButton
							value="name"
							activeValue={ sortKey }
							direction={ sortDirection }
							onChange={ onSortChange }
						>
							<span>{ __( 'Repository' ) }</span>
						</SortButton>
					</th>
					<th style={ { width: '100%' } }>
						<span>{ __( 'Last commit' ) }</span>
					</th>
					{ hasRuns ? (
						<>
							<th>
								<SortButton
									value="status"
									activeValue={ sortKey }
									direction={ sortDirection }
									onChange={ onSortChange }
								>
									<span>{ __( 'Status' ) }</span>
								</SortButton>
							</th>
							<th>
								<SortButton
									value="date"
									activeValue={ sortKey }
									direction={ sortDirection }
									onChange={ onSortChange }
								>
									<span>{ __( 'Date' ) }</span>
								</SortButton>
							</th>
							<th>
								<SortButton
									value="duration"
									activeValue={ sortKey }
									direction={ sortDirection }
									onChange={ onSortChange }
								>
									<span>{ __( 'Duration' ) }</span>
								</SortButton>
							</th>
						</>
					) : (
						<th colSpan={ 3 } />
					) }
					<th> </th>
				</tr>
			</thead>
			<tbody>
				{ deployments.map( ( deployment ) => (
					<DeploymentsListItem key={ deployment.id } deployment={ deployment } />
				) ) }
			</tbody>
		</table>
	);
};
