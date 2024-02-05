import { Button } from '@automattic/components';
import requestExternalAccess from '@automattic/request-external-access';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestKeyringConnections } from 'calypso/state/sharing/keyring/actions';
import { getKeyringServiceByName } from 'calypso/state/sharing/services/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from '../constants';
import { GITHUB_CONNECTION_QUERY_KEY, GithubConnectionData } from '../use-github-connection-query';

import './style.scss';

interface GitHubAuthorizeProps {
	buttonText?: string;
}

type Service = {
	connect_URL: string;
};

export const GitHubAuthorizeButton = ( props: GitHubAuthorizeProps ) => {
	const queryClient = useQueryClient();
	const siteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();
	const { buttonText = __( 'Authorize access to GitHub' ) } = props;

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
			const connectionKey = [ GITHUB_DEPLOYMENTS_QUERY_KEY, siteId, GITHUB_CONNECTION_QUERY_KEY ];
			await queryClient.invalidateQueries( {
				queryKey: connectionKey,
			} );

			const authorized =
				queryClient.getQueryData< GithubConnectionData >( connectionKey )?.connected;
			dispatch( recordTracksEvent( 'calypso_hosting_github_authorize_complete', { authorized } ) );
		},
	} );

	return (
		<Button
			primary
			busy={ isAuthorizing }
			disabled={ ! github || isAuthorizing }
			onClick={ () => authorize( github.connect_URL ) }
		>
			{ buttonText }
		</Button>
	);
};
