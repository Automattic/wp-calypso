import { useSelector } from 'react-redux';
import { GithubAuthorizeCard } from 'calypso/my-sites/hosting/github/github-authorize-card';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { DeploymentCard } from './deployment-card';
import { GithubConnectCard } from './github-connect-card';
import { GitHubPlaceholderCard } from './github-placeholder-card';
import { useGithubConnection } from './use-github-connection';

export const GitHubCard = () => {
	const siteId = useSelector( getSelectedSiteId );
	const { data: connection, isLoading: isFetching } = useGithubConnection( siteId );
	if ( isFetching || ! connection ) {
		return <GitHubPlaceholderCard />;
	}

	if ( connection.repo ) {
		return <DeploymentCard repo={ connection.repo } branch={ connection.branch } />;
	}

	if ( ! connection.repo && connection.connected ) {
		return <GithubConnectCard connection={ connection } />;
	}

	return <GithubAuthorizeCard />;
};
