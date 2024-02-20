import { useLayoutEffect, useState } from 'react';
import Pagination from 'calypso/components/pagination';
import { GitHubAccountData } from '../../use-github-accounts-query';
import {
	GitHubRepositoryData,
	useGithubRepositoriesQuery,
} from '../../use-github-repositories-query';
import { GitHubLoadingPlaceholder } from '../loading-placeholder';
import { GitHubRepositoryListTable, SortOption } from './repository-list-table';

const pageSize = 10;

interface RepositoriesListProps {
	account: GitHubAccountData;
	query: string;
	onSelectRepository( installation: GitHubAccountData, repository: GitHubRepositoryData ): void;
}

export const GitHubBrowseRepositoriesList = ( {
	account,
	query,
	onSelectRepository,
}: RepositoriesListProps ) => {
	const [ sort, setSort ] = useState< SortOption >( 'name_asc' );
	const [ page, setPage ] = useState( 1 );

	useLayoutEffect( () => {
		setPage( 1 );
	}, [ query ] );

	const { data: repositories = [], isLoading: isLoadingRepositories } = useGithubRepositoriesQuery(
		account.external_id
	);

	const filteredRepositories = sortRepositories( filterRepositories( repositories, query ), sort );

	const currentPage = filteredRepositories.slice(
		( page - 1 ) * pageSize,
		( page - 1 ) * pageSize + pageSize
	);

	if ( isLoadingRepositories ) {
		return <GitHubLoadingPlaceholder />;
	}

	return (
		<>
			<GitHubRepositoryListTable
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
		</>
	);
};

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
