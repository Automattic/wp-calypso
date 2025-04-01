import { useI18n } from '@wordpress/react-i18n';
import { SortButton } from '../components/sort-button/sort-button';
import { SortDirection } from '../components/sort-button/use-sort';
import { DeploymentsRunItem } from './deployments-run-item';
import { DeploymentRun } from './use-code-deployment-run-query';

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
	const { __ } = useI18n();

	if ( deploymentsRuns.length === 0 ) {
		return (
			<i css={ { color: 'var(--Gray-Gray-40, #50575E)' } }>
				{ __( 'This connection has no deployment runs yet.' ) }
			</i>
		);
	}

	return (
		<table className="github-deployments-logs">
			<thead>
				<tr>
					<th>
						<span>{ __( 'Author' ) }</span>
					</th>
					<th style={ { width: '100%' } }>
						<span>{ __( 'Commit' ) }</span>
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
					<th></th>
				</tr>
			</thead>
			<tbody>
				{ deploymentsRuns.map( ( run, index ) => (
					<DeploymentsRunItem key={ run.id } run={ run } rowNumber={ index } />
				) ) }
			</tbody>
		</table>
	);
};
