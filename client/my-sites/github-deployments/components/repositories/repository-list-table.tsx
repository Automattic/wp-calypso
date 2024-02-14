import { Button } from '@automattic/components';
import { ExternalLink, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { GitHubRepositoryData } from '../../use-github-repositories-query';
import { GitHubRepositoryListItem } from './repository-list-item';

export type SortOption = 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc';

interface GitHubAccountListTableProps {
	repositories: GitHubRepositoryData[];
	onSelect( repository: GitHubRepositoryData ): void;
	sortKey: SortOption;
	onSortChange( sort: SortOption ): void;
}

type SortPair = [ SortOption, SortOption ];

const nameSorts: SortPair = [ 'name_asc', 'name_desc' ];
const dateSorts: SortPair = [ 'date_asc', 'date_desc' ];

export const GitHubRepositoryListTable = ( {
	repositories,
	onSelect,
	sortKey,
	onSortChange,
}: GitHubAccountListTableProps ) => {
	function getSortIcon( pair: SortPair ) {
		if ( sortKey === pair[ 0 ] ) {
			return <Icon size={ 16 } icon={ chevronDown } />;
		} else if ( sortKey === pair[ 1 ] ) {
			return <Icon size={ 16 } icon={ chevronUp } />;
		}
	}

	function handleChangeSort( pair: SortPair ) {
		if ( sortKey === pair[ 0 ] ) {
			return pair[ 1 ];
		}
		return pair[ 0 ];
	}

	return (
		<div className="github-deployments-repository-list">
			<table>
				<thead>
					<tr>
						<th>
							<Button plain onClick={ () => onSortChange( handleChangeSort( nameSorts ) ) }>
								<span>{ __( 'Repository' ) }</span>
								{ getSortIcon( nameSorts ) }
							</Button>
						</th>
						<th>
							<Button plain onClick={ () => onSortChange( handleChangeSort( dateSorts ) ) }>
								<span>{ __( 'Last Updated ' ) }</span>
								{ getSortIcon( dateSorts ) }
							</Button>
						</th>
						<th> </th>
					</tr>
				</thead>
				<tbody>
					{ repositories.map( ( repository, index ) => (
						<GitHubRepositoryListItem
							key={ index }
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
