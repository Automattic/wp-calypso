import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { GitHubConnection } from 'calypso/my-sites/github-deployments/types';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { GitHubAuthorizeButton } from '../../authorize/authorize-button';
import { useGithubConnectionQuery } from '../../use-github-connection-query';
import { GitHubAccountList } from './account-list';
import { SearchAccounts } from './search-accounts';

import './style.scss';

export const GitHubAccounts = () => {
	const siteId = useSelector( getSelectedSiteId );
	const [ query, setQuery ] = useState( '' );

	const { data: connections } = useGithubConnectionQuery( siteId );

	const filter = ( connections: GitHubConnection[] ) => {
		const trimmed = query.toLowerCase().trim();
		if ( ! trimmed ) {
			return connections;
		}
		return connections.filter( ( connection ) =>
			connection.external_name.toLowerCase().includes( trimmed )
		);
	};

	return (
		<div className="github-deployments-accounts">
			<div className="github-deployments-accounts-header">
				<SearchAccounts value={ query } onChange={ setQuery } />
				<GitHubAuthorizeButton buttonText={ __( 'Connect GitHub Account' ) } />
			</div>
			<GitHubAccountList connections={ filter( connections || [] ) } />
		</div>
	);
};
