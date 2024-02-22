import { __ } from '@wordpress/i18n';
import { SortButton } from 'calypso/my-sites/github-deployments/components/sort-button/sort-button';
import { SortDirection } from 'calypso/my-sites/github-deployments/components/sort-button/use-sort';
import { CodeDeploymentData } from 'calypso/my-sites/github-deployments/deployments/use-code-deployments-query';
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
					<th>
						<span>{ __( 'Last commit' ) }</span>
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
