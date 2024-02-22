import { useLayoutEffect, useState } from 'react';
import Pagination from 'calypso/components/pagination';
import {
	SortDirection,
	useSort,
} from 'calypso/my-sites/github-deployments/components/sort-button/use-sort';
import { GitHubInstallationData } from '../../use-github-installations-query';
import {
	GitHubRepositoryData,
	useGithubRepositoriesQuery,
} from '../../use-github-repositories-query';
import { GitHubLoadingPlaceholder } from '../loading-placeholder';
import { GitHubRepositoryListTable } from './repository-list-table';

const pageSize = 10;

interface RepositoriesListProps {
	installation: GitHubInstallationData;
	query: string;
	onSelectRepository(
		installation: GitHubInstallationData,
		repository: GitHubRepositoryData
	): void;
}

export const GitHubBrowseRepositoriesList = ( {
	installation,
	query,
	onSelectRepository,
}: RepositoriesListProps ) => {
	const { key, direction, handleSortChange } = useSort( 'name' );
	const [ page, setPage ] = useState( 1 );

	useLayoutEffect( () => {
		setPage( 1 );
	}, [ query ] );

	const { data: repositories = [], isLoading: isLoadingRepositories } = useGithubRepositoriesQuery(
		installation.external_id
	);

	const filteredRepositories = applySort(
		filterRepositories( repositories, query ),
		key,
		direction
	);

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
				onSelect={ ( repository ) => onSelectRepository( installation, repository ) }
				sortKey={ key }
				sortDirection={ direction }
				onSortChange={ handleSortChange }
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

function applySort( repositories: GitHubRepositoryData[], key: string, direction: SortDirection ) {
	switch ( key ) {
		case 'name':
			if ( direction === 'asc' ) {
				return repositories.sort( ( left, right ) => {
					return left.name.localeCompare( right.name );
				} );
			}
			return repositories.sort( ( left, right ) => {
				return left.name.localeCompare( right.name ) * -1;
			} );

		case 'date':
			if ( direction === 'asc' ) {
				return repositories.sort( ( left, right ) => {
					return left.updated_at.localeCompare( right.updated_at );
				} );
			}
			return repositories.sort( ( left, right ) => {
				return left.updated_at.localeCompare( right.updated_at ) * -1;
			} );

		default:
			return repositories;
	}
}
