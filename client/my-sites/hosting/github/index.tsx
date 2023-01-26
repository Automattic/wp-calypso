import { isEnabled } from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import { GithubAuthorizeCard } from 'calypso/my-sites/hosting/github/github-authorize-card/index';
import { GithubConnectCard } from 'calypso/my-sites/hosting/github/github-connect-card/index';
import {
	getKeyringConnections,
	isKeyringConnectionsFetching,
} from 'calypso/state/sharing/keyring/selectors';

export const GitHubCard = () => {
	const isFetching = useSelector( isKeyringConnectionsFetching );
	const connections = useSelector( getKeyringConnections );

	if ( ! isEnabled( 'hosting/github-integration' ) ) {
		return null;
	}

	if ( isFetching ) {
		// todo render placeholder
		return null;
	}

	const gitHub = connections.find( ( connection ) => connection.service === 'github' );

	if ( gitHub ) {
		return <GithubConnectCard />;
	}
	return <GithubAuthorizeCard />;
};
