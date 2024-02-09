import { Button, Card } from '@automattic/components';
import requestExternalAccess from '@automattic/request-external-access';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import QueryKeyringConnections from 'calypso/components/data/query-keyring-connections/index';
import QueryKeyringServices from 'calypso/components/data/query-keyring-services/index';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestKeyringConnections } from 'calypso/state/sharing/keyring/actions';
import { getKeyringServiceByName } from 'calypso/state/sharing/services/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { GITHUB_INTEGRATION_QUERY_KEY } from './constants';
import { DisconnectGitHubButton } from './disconnect-github-button/index';
import {
	GITHUB_CONNECTION_QUERY_KEY,
	GithubConnectionData,
	useGithubConnectionQuery,
} from './use-github-connection-query';

type Service = {
	connect_URL: string;
};

export const GitHubAppCard = () => {
	const queryClient = useQueryClient();
	const siteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();
	const github = useSelector( ( state ) =>
		getKeyringServiceByName( state, 'github-app' )
	) as Service;

	const { data: connections } = useGithubConnectionQuery( siteId );

	const { mutate: authorize, isPending: isAuthorizing } = useMutation< void, unknown, string >( {
		mutationFn: async ( connectURL ) => {
			dispatch( recordTracksEvent( 'calypso_hosting_github_authorize_click' ) );
			await new Promise( ( resolve ) => requestExternalAccess( connectURL, resolve ) );
			await dispatch( requestKeyringConnections() );
		},
		onSuccess: async () => {
			const connectionKey = [ GITHUB_INTEGRATION_QUERY_KEY, siteId, GITHUB_CONNECTION_QUERY_KEY ];
			await queryClient.invalidateQueries( {
				queryKey: connectionKey,
			} );

			const authorized =
				queryClient.getQueryData< GithubConnectionData >( connectionKey )?.connected;
			dispatch( recordTracksEvent( 'calypso_hosting_github_authorize_complete', { authorized } ) );
		},
	} );

	return (
		<>
			<QueryKeyringServices />
			<QueryKeyringConnections />
			<Card className="github-hosting-card">
				<span>GitHub App</span>
				<div
					style={ {
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-start',
						gap: 16,
						width: '100%',
					} }
				>
					{ github && (
						<Button
							className="is-primary"
							busy={ isAuthorizing }
							disabled={ ! github || isAuthorizing }
							onClick={ () => authorize( github.connect_URL ) }
						>
							{ translate( 'Authorize GitHub Account' ) }
						</Button>
					) }

					{ ( connections || [] ).map( ( connection, key ) => (
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
			</Card>
		</>
	);
};
