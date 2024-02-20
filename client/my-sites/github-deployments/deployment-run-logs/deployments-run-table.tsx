import { __ } from '@wordpress/i18n';
import { SortButton } from 'calypso/my-sites/github-deployments/components/sort-button/sort-button';
import { SortDirection } from 'calypso/my-sites/github-deployments/components/sort-button/use-sort';
import { DeploymentRun } from 'calypso/my-sites/github-deployments/deployments/use-code-deployments-query';
import { DeploymentsRunItem } from './deployments-run-item';

interface DeploymentsRunsTableProps {
	deploymentsRuns: DeploymentRun[];
	sortKey: string;
	sortDirection: SortDirection;
	onSortChange( key: string ): void;
}

export const DeploymentsRunsTable = ( {
	deploymentsRuns,
	sortKey,
	sortDirection,
	onSortChange,
}: DeploymentsRunsTableProps ) => {
	return (
		<table className="github-deployments-logs">
			<thead>
				<tr>
					<th>
						<span>{ __( 'Commit' ) }</span>
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
							value="duration"
							activeValue={ sortKey }
							direction={ sortDirection }
							onChange={ onSortChange }
						>
							<span>{ __( 'Duration' ) }</span>
						</SortButton>
					</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{ deploymentsRuns.map( ( run ) => (
					<DeploymentsRunItem key={ run.id } run={ run } />
				) ) }
			</tbody>
		</table>
	);
};
