import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { DeploymentCard } from './deployment-card';
import { GithubAuthorizeCard } from './github-authorize-card';
import { GithubConnectCard } from './github-connect-card';
import { GitHubPlaceholderCard } from './github-placeholder-card';
import { useGithubConnectionQuery } from './use-github-connection-query';

export const GitHubCard = () => {
	const siteId = useSelector( getSelectedSiteId );
	const { data: connection, isLoading: isFetching } = useGithubConnectionQuery( siteId );

	if ( isFetching || ! connection ) {
		return <GitHubPlaceholderCard />;
	}

	if ( connection.repo ) {
		return (
			<DeploymentCard
				repo={ connection.repo }
				branch={ connection.branch }
				connectionId={ connection.ID }
			/>
		);
	}

	if ( ! connection.repo && connection.connected ) {
		return <GithubConnectCard connection={ connection } />;
	}

	return <GithubAuthorizeCard />;
};
