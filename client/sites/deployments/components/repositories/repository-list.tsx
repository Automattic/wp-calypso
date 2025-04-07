import { ExternalLink, Spinner } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useLayoutEffect, useState } from 'react';
import Pagination from 'calypso/components/pagination';
import { GitHubInstallationData } from '../../use-github-installations-query';
import {
	GitHubRepositoryData,
	useGithubRepositoriesQuery,
} from '../../use-github-repositories-query';
import { SortDirection, useSort } from '../sort-button/use-sort';
import { NoResults } from './no-results';
import { GitHubRepositoryListTable } from './repository-list-table';

import './style.scss';

const pageSize = 5;

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
	const { __ } = useI18n();
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
		return <Spinner />;
	}

	if ( currentPage.length === 0 ) {
		return <NoResults manageInstallationUrl={ installation.management_url } />;
	}

	const getRepositoryPermissionsNotice = () => {
		if ( installation.repository_selection === 'all' ) {
			return (
				<p className="github-repositories-list-permissions-notice">
					{ __( 'Need to adjust permissions?' ) }{ ' ' }
					<ExternalLink href={ installation.management_url }>
						{ __( 'Update them on GitHub' ) }
					</ExternalLink>
				</p>
			);
		}

		return (
			<p className="github-repositories-list-permissions-notice">
				{ __( 'Missing GitHub repositories?' ) }{ ' ' }
				<ExternalLink href={ installation.management_url }>
					{ __( 'Adjust permissions on GitHub' ) }
				</ExternalLink>
			</p>
		);
	};

	return (
		<div className="github-repositories-list">
			<GitHubRepositoryListTable
				repositories={ currentPage }
				onSelect={ ( repository ) => onSelectRepository( installation, repository ) }
				sortKey={ key }
				sortDirection={ direction }
				onSortChange={ handleSortChange }
			/>
			{ getRepositoryPermissionsNotice() }
			<Pagination
				page={ page }
				perPage={ pageSize }
				total={ filteredRepositories.length }
				pageClick={ setPage }
			/>
		</div>
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
