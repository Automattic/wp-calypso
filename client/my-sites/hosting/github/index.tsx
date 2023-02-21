import { useSelector } from 'react-redux';
import { GithubAuthorizeCard } from 'calypso/my-sites/hosting/github/github-authorize-card';
import { GithubConnectCard } from 'calypso/my-sites/hosting/github/github-connect-card';
import { getSelectedSiteId } from 'calypso/state/ui/selectors/index';
import { GitHubPlaceholderCard } from './github-placeholder-card';
import { useGithubConnection } from './use-github-connection';

export const GitHubCard = () => {
	const siteId = useSelector( getSelectedSiteId );
	const { data: connection, isLoading } = useGithubConnection( siteId );

	if ( isLoading ) {
		return <GitHubPlaceholderCard />;
	}

	if ( connection?.connected ) {
		return <GithubConnectCard connection={ connection } />;
	}

	return <GithubAuthorizeCard />;
};
