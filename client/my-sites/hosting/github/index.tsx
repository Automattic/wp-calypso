import { isEnabled } from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import { GithubAuthorizeCard } from 'calypso/my-sites/hosting/github/github-authorize-card/index';
import { GithubConnectCard } from 'calypso/my-sites/hosting/github/github-connect-card/index';
import {
	getKeyringConnections,
	isKeyringConnectionsFetching,
} from 'calypso/state/sharing/keyring/selectors';
import { GitHubPlaceholderCard } from './github-placeholder-card';

export const GitHubCard = () => {
	const isFetching = useSelector( isKeyringConnectionsFetching );
	const connections = useSelector( getKeyringConnections );

	if ( ! isEnabled( 'hosting/github-integration' ) ) {
		return null;
	}

	if ( isFetching ) {
		return <GitHubPlaceholderCard />;
	}

	const gitHub = connections.find( ( connection ) => connection.service === 'github-deploy' );

	if ( gitHub ) {
		return <GithubConnectCard />;
	}
	return <GithubAuthorizeCard />;
};
