import { useState } from 'react';
import Pagination from 'calypso/components/pagination/index';
import { GitHubLoadingPlaceholder } from 'calypso/my-sites/github-deployments/loading-placeholder';
import { GitHubAccountsDropdown } from '../../components/accounts-dropdown/index';
import { GitHubAccountData } from '../../use-github-accounts-query';
import {
	GitHubRepositoryData,
	useGithubRepositoriesQuery,
} from '../../use-github-repositories-query';
import { GitHubRepositoryList } from './repository-list';
import { SearchRepos } from './search-repos';
import './style.scss';

interface GitHubBrowseRepositoriesProps {
	accounts: GitHubAccountData[];
	account: GitHubAccountData;
	repositories: GitHubRepositoryData[];
	onSelectRepository( repository: GitHubRepositoryData ): void;
	onChangeAccount( account: GitHubAccountData ): void;
}

function filterRepositories( repositories: GitHubRepositoryData[], query: string ) {
	const trimmed = query.trim();
	if ( trimmed ) {
		return repositories.filter( ( repository ) =>
			repository.full_name.toLowerCase().includes( trimmed )
		);
	}
	return repositories;
}

const pageSize = 10;

export const GitHubBrowseRepositories = ( {
	accounts,
	account,
	onSelectRepository,
	onChangeAccount,
}: GitHubBrowseRepositoriesProps ) => {
	const [ page, setPage ] = useState( 1 );
	const { data: repositories = [], isLoading: isLoadingRepositories } = useGithubRepositoriesQuery(
		account.external_id
	);

	const [ query, setQuery ] = useState( '' );
	const filteredRepositories = filterRepositories( repositories, query );
	const currentPage = filteredRepositories.slice(
		( page - 1 ) * pageSize,
		( page - 1 ) * pageSize + pageSize
	);

	if ( isLoadingRepositories ) {
		return <GitHubLoadingPlaceholder />;
	}

	return (
		<div className="github-deployments-repositories">
			<div className="github-deployments-repositories__search-bar">
				<GitHubAccountsDropdown
					accounts={ accounts }
					value={ account }
					onChange={ onChangeAccount }
				/>
				<SearchRepos value={ query } onChange={ setQuery } />
			</div>
			<GitHubRepositoryList repositories={ currentPage } onSelect={ onSelectRepository } />
			<Pagination
				page={ page }
				perPage={ pageSize }
				total={ repositories.length }
				pageClick={ setPage }
			/>
		</div>
	);
};
