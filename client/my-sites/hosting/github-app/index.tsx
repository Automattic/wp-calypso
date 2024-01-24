import { Button, Card } from '@automattic/components';
import requestExternalAccess from '@automattic/request-external-access';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import QueryKeyringConnections from 'calypso/components/data/query-keyring-connections/index';
import QueryKeyringServices from 'calypso/components/data/query-keyring-services/index';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { requestKeyringConnections } from 'calypso/state/sharing/keyring/actions';
import { getKeyringServiceByName } from 'calypso/state/sharing/services/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { GITHUB_INTEGRATION_QUERY_KEY } from './constants';
import { DisconnectGitHubButton } from './disconnect-github-button/index';
import { SearchRepos } from './search-repos';
import {
	GITHUB_CONNECTION_QUERY_KEY,
	GithubConnectionData,
	useGithubConnectionQuery,
} from './use-github-connection-query';
import { useGithubCreateDeploymentMutation } from './use-github-create-deployment-mutation';
import { useGithubDeleteDeploymentMutation } from './use-github-delete-deployment-mutation';
import { useGithubDeploymentsQuery } from './use-github-deployments-query';
import './style.scss';

type Service = {
	connect_URL: string;
};

const noticeOptions = {
	duration: 3000,
};

export const GitHubAppCard = () => {
	const queryClient = useQueryClient();
	const [ newRepoName, setNewRepoName ] = useState();
	const [ selectedRepo, setSetSelectedRepo ] = useState<
		{ repoName: string; branchName: string } | undefined
	>( undefined );
	const siteId = useSelector( getSelectedSiteId );
	const { data: connection } = useGithubConnectionQuery( siteId );
	const { data: connectedRepositories = {} } = useGithubDeploymentsQuery( siteId );
	const dispatch = useDispatch();
	const github = useSelector( ( state ) =>
		getKeyringServiceByName( state, 'github-app' )
	) as Service;

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

	const { createDeployment, isPending: isCreatingDeployment } = useGithubCreateDeploymentMutation(
		siteId,
		{
			onSuccess: () => {
				dispatch( successNotice( __( 'Deployment created.' ), noticeOptions ) );
			},
			onError: ( error ) => {
				dispatch(
					errorNotice(
						// translators: "reason" is why connecting the branch failed.
						sprintf( __( 'Failed to connect: %(reason)s' ), { reason: error.message } ),
						{
							...noticeOptions,
						}
					)
				);
			},
			onSettled: ( _, error ) => {
				dispatch(
					recordTracksEvent( 'calypso_hosting_github_connect_complete', { connected: ! error } )
				);
			},
		}
	);

	const { deleteDeployment } = useGithubDeleteDeploymentMutation( siteId, {
		onSuccess: () => {
			dispatch( successNotice( __( 'Deployment deleted.' ) ) );
		},
	} );

	const handleDeleteDeploymentRepository = ( repoName: string ) => {
		deleteDeployment( {
			repoName,
		} );
	};

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
					{ connection?.ID && <DisconnectGitHubButton connection={ connection } /> }
					{ ! connection?.ID && (
						<Button
							className="is-primary"
							busy={ isAuthorizing }
							disabled={ ! github || isAuthorizing }
							onClick={ () => authorize( github.connect_URL ) }
						>
							{ translate( 'Add connection' ) }
						</Button>
					) }
					<div
						style={ {
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'flex-start',
							gap: 16,
							width: '100%',
						} }
					>
						{ connection?.ID && (
							<div
								style={ {
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									width: '100%',
								} }
							>
								<SearchRepos
									siteId={ siteId }
									connectionId={ connection.ID }
									onSelect={ ( repoName, branchName ) =>
										setSetSelectedRepo( { repoName, branchName } )
									}
									// eslint-disable-next-line no-console
									onChange={ console.log }
								/>
								<Button
									primary
									style={ { minWidth: 200 } }
									onClick={ () => {
										createDeployment( selectedRepo );
									} }
									busy={ isCreatingDeployment }
									disabled={ ! selectedRepo }
								>
									<span>{ __( 'Create deployment' ) }</span>
								</Button>
							</div>
						) }
						<div
							style={ {
								borderTop: '1px solid rgba(0,0,0, .1)',
								height: 1,
								width: '100%',
								margin: '16px 0',
							} }
						/>
						<div style={ { width: '100%' } }>
							{ connection?.ID && (
								<div
									style={ {
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										width: '100%',
									} }
								>
									<input
										className="form-text-input"
										type="text"
										value={ newRepoName }
										onChange={ ( event ) => setNewRepoName( event.target.value ) }
									/>
									<Button
										primary
										style={ { minWidth: 200 } }
										onClick={ () => {
											createDeployment( {
												repoName: newRepoName,
												template: 'sage',
											} );
										} }
										busy={ isCreatingDeployment }
										disabled={ ! newRepoName }
									>
										<span>{ __( 'Create Sage repo' ) }</span>
									</Button>
								</div>
							) }
						</div>

						<div
							style={ {
								borderTop: '1px solid rgba(0,0,0, .1)',
								height: 1,
								width: '100%',
								margin: '16px 0',
							} }
						/>

						<div style={ { display: 'flex', flexDirection: 'column', gap: 8, width: '100%' } }>
							<strong>Connected branches</strong>
							{ Object.entries( connectedRepositories ).map( ( entry ) => (
								<div
									style={ {
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
									} }
								>
									<p style={ { marginBottom: 0 } }>
										{ entry[ 0 ] } - { entry[ 1 ] }
									</p>
									<Button onClick={ () => handleDeleteDeploymentRepository( entry[ 0 ] ) }>
										Disconnect
									</Button>
								</div>
							) ) }
						</div>
					</div>
				</div>
			</Card>
		</>
	);
};
