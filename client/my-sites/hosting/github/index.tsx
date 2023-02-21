import { useSelector } from 'react-redux';
import { GithubAuthorizeCard } from 'calypso/my-sites/hosting/github/github-authorize-card';
import {
	getKeyringConnections,
	isKeyringConnectionsFetching,
} from 'calypso/state/sharing/keyring/selectors';
import { DeploymentCard } from './deployment-card';
import { GitHubPlaceholderCard } from './github-placeholder-card';

export const GitHubCard = () => {
	const isFetching = useSelector( isKeyringConnectionsFetching );
	const connections = useSelector( getKeyringConnections );

	if ( isFetching ) {
		return <GitHubPlaceholderCard />;
	}

	const gitHub = connections.find( ( connection ) => connection.service === 'github-deploy' );

	if ( gitHub ) {
		return <DeploymentCard repo="Automattic/testing" branch="main" />;
	}

	return <GithubAuthorizeCard />;
};
