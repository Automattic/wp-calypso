import { useState } from 'react';
import { GitHubAccountsDropdown } from '../../components/accounts-dropdown/index';
import { GitHubAccountData } from '../../use-github-accounts-query';
import { GitHubRepositoryData } from '../../use-github-repositories-query';
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

export const GitHubBrowseRepositories = ( {
	accounts,
	account,
	repositories,
	onSelectRepository,
	onChangeAccount,
}: GitHubBrowseRepositoriesProps ) => {
	const [ query, setQuery ] = useState( '' );

	const filteredRepositories = filterRepositories( repositories, query );
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
			<GitHubRepositoryList repositories={ filteredRepositories } onSelect={ onSelectRepository } />
		</div>
	);
};
