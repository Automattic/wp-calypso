import { __ } from '@wordpress/i18n';
import { SortButton } from 'calypso/my-sites/github-deployments/components/sort-button/sort-button';
import { SortDirection } from 'calypso/my-sites/github-deployments/components/sort-button/use-sort';
import { CodeDeploymentData } from 'calypso/my-sites/github-deployments/deployments/use-code-deployments-query';
import { DeploymentsRunItem } from './deployments-run-item';

interface DeploymentsRunsTableProps {
	deployments: CodeDeploymentData[];
	sortKey: string;
	sortDirection: SortDirection;
	onSortChange( key: string ): void;
}

export const DeploymentsRunsTable = ( {
	deployments,
	sortKey,
	sortDirection,
	onSortChange,
}: DeploymentsRunsTableProps ) => {
	return (
		<table>
			<thead>
				<tr>
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
						<span>{ __( 'Last commit' ) }</span>
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
				</tr>
			</thead>
			<tbody>
				{ deployments.map( ( deployment ) => (
					<DeploymentsRunItem key={ deployment.id } deployment={ deployment } />
				) ) }
			</tbody>
		</table>
	);
};
