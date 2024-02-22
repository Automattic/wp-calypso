import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { SortButton } from 'calypso/my-sites/github-deployments/components/sort-button/sort-button';
import { SortDirection } from 'calypso/my-sites/github-deployments/components/sort-button/use-sort';
import { GitHubRepositoryData } from '../../use-github-repositories-query';
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
	return (
		<div className="github-deployments-repository-list">
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
							<SortButton
								value="date"
								activeValue={ sortKey }
								direction={ sortDirection }
								onChange={ onSortChange }
							>
								<span>{ __( 'Last update' ) }</span>
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
			<p className="github-deployments-adjust-permissions">
				{ __( 'Missing some repositories?' ) }{ ' ' }
				<ExternalLink href="#"> { __( 'Adjust permissions on GitHub' ) } </ExternalLink>
			</p>
		</div>
	);
};
