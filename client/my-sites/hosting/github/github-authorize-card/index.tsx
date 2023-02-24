import { Button, Card } from '@automattic/components';
import requestExternalAccess from '@automattic/request-external-access';
import { translate } from 'i18n-calypso';
import { useMutation, useQueryClient } from 'react-query';
import { useSelector, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import SocialLogo from 'calypso/components/social-logo';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestKeyringConnections } from 'calypso/state/sharing/keyring/actions';
import { getKeyringServiceByName } from 'calypso/state/sharing/services/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import '../style.scss';
import { GITHUB_INTEGRATION_QUERY_KEY } from '../constants';
import { GithubConnectionData, GITHUB_CONNECTION_QUERY_KEY } from '../use-github-connection-query';

type Service = {
	connect_URL: string;
};

export const GithubAuthorizeCard = () => {
	const queryClient = useQueryClient();
	const siteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();
	const github = useSelector( ( state ) =>
		getKeyringServiceByName( state, 'github-deploy' )
	) as Service;

	const { mutate: authorize, isLoading: isAuthorizing } = useMutation< void, unknown, string >(
		async ( connectURL ) => {
			dispatch( recordTracksEvent( 'calypso_hosting_github_authorize_click' ) );
			await new Promise( ( resolve ) => requestExternalAccess( connectURL, resolve ) );
			await dispatch( requestKeyringConnections() );
		},
		{
			onSuccess: async () => {
				const connectionKey = [ GITHUB_INTEGRATION_QUERY_KEY, siteId, GITHUB_CONNECTION_QUERY_KEY ];
				await queryClient.invalidateQueries( connectionKey );

				const authorized =
					queryClient.getQueryData< GithubConnectionData >( connectionKey )?.connected;
				dispatch(
					recordTracksEvent( 'calypso_hosting_github_authorize_complete', { authorized } )
				);
			},
		}
	);

	return (
		<Card className="github-hosting-card">
			<SocialLogo className="material-icon" icon="github" size={ 32 } />
			<CardHeading>{ translate( 'Deploy from GitHub' ) }</CardHeading>
			<p>
				{ translate(
					'Connect this site to a GitHub repository and automatically deploy branches on push.'
				) }
			</p>
			<Button
				className="is-primary"
				busy={ isAuthorizing }
				disabled={ ! github || isAuthorizing }
				onClick={ () => authorize( github.connect_URL ) }
			>
				{ translate( 'Authorize access to Github' ) }
			</Button>
		</Card>
	);
};
