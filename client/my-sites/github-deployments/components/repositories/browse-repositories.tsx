import { Card } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { ComponentProps, useState } from 'react';
import { GitHubAccountsDropdown } from '../accounts-dropdown';
import { useLiveAccounts } from '../accounts-dropdown/use-live-accounts';
import { GitHubLoadingPlaceholder } from '../loading-placeholder';
import { GitHubBrowseRepositoriesList } from './repository-list';
import { SearchRepos } from './search-repos';
import './style.scss';

type GitHubBrowseRepositoriesProps = {
	initialInstallationId?: number;
} & Pick< ComponentProps< typeof GitHubBrowseRepositoriesList >, 'onSelectRepository' >;

export const GitHubBrowseRepositories = ( {
	initialInstallationId,
	onSelectRepository,
}: GitHubBrowseRepositoriesProps ) => {
	const { __ } = useI18n();
	const { account, setAccount, accounts, onNewInstallationRequest } = useLiveAccounts( {
		initialAccountId: initialInstallationId,
	} );

	const [ query, setQuery ] = useState( '' );

	function handleQueryChange( query: string ) {
		setQuery( query );
	}

	const renderContent = () => {
		if ( ! accounts ) {
			return <GitHubLoadingPlaceholder />;
		}

		if ( ! account ) {
			return (
				<Card css={ { display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 0 } }>
					<span>{ __( 'Add a GitHub account to import an existing repository.' ) }</span>
				</Card>
			);
		}

		return (
			<GitHubBrowseRepositoriesList
				onSelectRepository={ onSelectRepository }
				account={ account }
				query={ query }
			/>
		);
	};

	return (
		<div className="github-deployments-repositories">
			<div className="github-deployments-repositories__search-bar">
				<GitHubAccountsDropdown
					onAddAccount={ onNewInstallationRequest }
					accounts={ accounts }
					value={ account }
					onChange={ setAccount }
				/>
				<SearchRepos value={ query } onChange={ handleQueryChange } />
			</div>
			{ renderContent() }
		</div>
	);
};
