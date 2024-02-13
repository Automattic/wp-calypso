import { useState } from 'react';
import Pagination from 'calypso/components/pagination/index';
import { GitHubLoadingPlaceholder } from 'calypso/my-sites/github-deployments/components/loading-placeholder';
import { GitHubAccountData } from '../../use-github-accounts-query';
import {
	GitHubRepositoryData,
	useGithubRepositoriesQuery,
} from '../../use-github-repositories-query';
import { GitHubAccountsDropdown } from '../accounts-dropdown/index';
import { GitHubRepositoryList } from './repository-list';
import { SearchRepos } from './search-repos';
import './style.scss';

interface GitHubBrowseRepositoriesProps {
	accounts: GitHubAccountData[];
	initialInstallationId?: number;
	onSelectRepository( installation: GitHubAccountData, repository: GitHubRepositoryData ): void;
}

const pageSize = 10;

export type SortOption = 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc';

function filterRepositories( repositories: GitHubRepositoryData[], query: string ) {
	const trimmed = query.trim();
	if ( trimmed ) {
		return repositories.filter( ( repository ) =>
			repository.name.toLowerCase().includes( trimmed )
		);
	}
	return repositories;
}

function sortRepositories( repositories: GitHubRepositoryData[], sortKey: SortOption ) {
	switch ( sortKey ) {
		case 'name_asc':
			return repositories.sort( ( left, right ) => {
				return left.name.localeCompare( right.name );
			} );
		case 'date_asc':
			return repositories.sort( ( left, right ) => {
				return left.updated_at.localeCompare( right.updated_at );
			} );
		case 'name_desc':
			return repositories.sort( ( left, right ) => {
				return left.name.localeCompare( right.name ) * -1;
			} );
		case 'date_desc':
			return repositories.sort( ( left, right ) => {
				return left.updated_at.localeCompare( right.updated_at ) * -1;
			} );
		default:
			return repositories;
	}
}

export const GitHubBrowseRepositories = ( {
	accounts,
	initialInstallationId,
	onSelectRepository,
}: GitHubBrowseRepositoriesProps ) => {
	const [ account, setAccount ] = useState< GitHubAccountData >( () => {
		const preselectedInstallation = accounts.find(
			( account ) => account.external_id === initialInstallationId
		);

		return preselectedInstallation ?? accounts[ 0 ];
	} );

	const [ sort, setSort ] = useState< SortOption >( 'name_desc' );
	const [ page, setPage ] = useState( 1 );
	const [ query, setQuery ] = useState( '' );

	const { data: repositories = [], isLoading: isLoadingRepositories } = useGithubRepositoriesQuery(
		account.external_id
	);

	const filteredRepositories = sortRepositories( filterRepositories( repositories, query ), sort );

	const currentPage = filteredRepositories.slice(
		( page - 1 ) * pageSize,
		( page - 1 ) * pageSize + pageSize
	);

	function handleQueryChange( query: string ) {
		setQuery( query );
		setPage( 1 );
	}

	if ( isLoadingRepositories ) {
		return <GitHubLoadingPlaceholder />;
	}

	return (
		<div className="github-deployments-repositories">
			<div className="github-deployments-repositories__search-bar">
				<GitHubAccountsDropdown accounts={ accounts } value={ account } onChange={ setAccount } />
				<SearchRepos value={ query } onChange={ handleQueryChange } />
			</div>
			<GitHubRepositoryList
				repositories={ currentPage }
				onSelect={ ( repository ) => onSelectRepository( account, repository ) }
				sortKey={ sort }
				onSortChange={ setSort }
			/>
			<Pagination
				page={ page }
				perPage={ pageSize }
				total={ filteredRepositories.length }
				pageClick={ setPage }
			/>
		</div>
	);
};
