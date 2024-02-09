import { Button, Card } from '@automattic/components';
import { translate } from 'i18n-calypso';
import QueryKeyringConnections from 'calypso/components/data/query-keyring-connections/index';
import QueryKeyringServices from 'calypso/components/data/query-keyring-services/index';
import { useGithubAuthorizationQuery } from 'calypso/lib/github/use-github-authorization-query';
import { useSelector } from 'calypso/state';
import { getKeyringServiceByName } from 'calypso/state/sharing/services/selectors';
import KeyringConnectButton from '../../blocks/keyring-connect-button';
import { useGitHubAuthorizeMutation } from '../../lib/github/use-github-authorize-mutation';
import { DisconnectGitHubButton } from './disconnect-button';

type Service = {
	connect_URL: string;
};

export const GitHubAuthorization = () => {
	const github = useSelector( ( state ) =>
		getKeyringServiceByName( state, 'github-app' )
	) as Service;

	const { data: connections = [] } = useGithubAuthorizationQuery();
	const { authorize, isAuthorizing } = useGitHubAuthorizeMutation();

	return (
		<>
			{ /* <QueryKeyringServices />
			<QueryKeyringConnections /> */ }
			<div
				style={ {
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-start',
					gap: 16,
					width: '100%',
				} }
			>
				<KeyringConnectButton serviceId="github-app" onConnect={ console.log }>
					{ translate( 'Authorize GitHub Account' ) }
				</KeyringConnectButton>
				{ /* { github && (
					<Button
						className="is-primary"
						busy={ isAuthorizing }
						disabled={ ! github || isAuthorizing }
						onClick={ () => authorize( github.connect_URL ) }
					>
						{ translate( 'Authorize GitHub Account' ) }
					</Button>
				) } */ }

				{ connections.map( ( connection, key ) => (
					<div key={ key } style={ { display: 'flex', alignItems: 'center', width: '100%' } }>
						<span style={ { marginRight: 'auto' } }>{ connection.external_name }</span>
						<span
							style={ {
								marginRight: 'auto',
								maxWidth: 150,
								fontSize: 'small',
								overflow: 'hidden',
								whiteSpace: 'nowrap',
								textOverflow: 'ellipsis',
							} }
							title={ Object.keys( connection.installation.repositories ).join( ', ' ) }
						>
							Repos: { Object.keys( connection.installation.repositories ).join( ', ' ) }
						</span>
						<div style={ { display: 'flex', alignItems: 'center', gap: 24 } }>
							<Button
								className="is-primary"
								busy={ isAuthorizing }
								disabled={ ! github || isAuthorizing }
								onClick={ () =>
									authorize(
										`https://github.com/settings/installations/${ connection?.installation.id }`
									)
								}
							>
								{ translate( 'Modify' ) }
							</Button>
							<DisconnectGitHubButton connection={ connection } />
						</div>
					</div>
				) ) }
			</div>
		</>
	);
};
