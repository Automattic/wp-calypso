import { useI18n } from '@wordpress/react-i18n';
import { GitHubRepositoryData } from '../../use-github-repositories-query';
import { SortButton } from '../sort-button/sort-button';
import { SortDirection } from '../sort-button/use-sort';
import { GitHubRepositoryListItem } from './repository-list-item';

interface GitHubInstallationListTableProps {
	repositories: GitHubRepositoryData[];
	onSelect( repository: GitHubRepositoryData ): void;
	sortKey: string;
	sortDirection: SortDirection;
	onSortChange( key: string ): void;
}

export const GitHubRepositoryListTable = ( {
	repositories,
	onSelect,
	sortKey,
	sortDirection,
	onSortChange,
}: GitHubInstallationListTableProps ) => {
	const { __ } = useI18n();

	return (
		<table className="github-deployments-repository-list-table">
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
						<SortButton
							value="date"
							activeValue={ sortKey }
							direction={ sortDirection }
							onChange={ onSortChange }
						>
							<span>{ __( 'Last updated' ) }</span>
						</SortButton>
					</th>
					<th> </th>
				</tr>
			</thead>
			<tbody>
				{ repositories.map( ( repository ) => (
					<GitHubRepositoryListItem
						key={ repository.id }
						repository={ repository }
						onSelect={ () => onSelect( repository ) }
					/>
				) ) }
			</tbody>
		</table>
	);
};
