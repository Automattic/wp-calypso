import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, ExternalLink, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import EllipsisMenu from 'calypso/components/ellipsis-menu/index';
import Image from 'calypso/components/image/index';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import PopoverMenuSeparator from 'calypso/components/popover-menu/separator';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from 'calypso/my-sites/github-deployments/constants';
import { GitHubConnection } from 'calypso/my-sites/github-deployments/types';
import { GITHUB_CONNECTION_QUERY_KEY } from 'calypso/my-sites/github-deployments/use-github-connection-query';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useDispatch, useSelector } from 'calypso/state/index';
import { deleteStoredKeyringConnection } from 'calypso/state/sharing/keyring/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors/index';

interface GitHubAccountListItemProps {
	connection: GitHubConnection;
}

function getConfigureURL( { installation }: GitHubConnection ) {
	if ( installation.type === 'User' ) {
		return `https://github.com/settings/installations/${ installation.id }`;
	}
	return `https://github.com/organizations/${ installation.login }/settings/installations/${ installation.id }`;
}

function getRepositoryAccess( { installation: { repositories } }: GitHubConnection ) {
	const repos = Object.values( repositories );
	if ( repos.length === 1 && repos[ 0 ] === 'all' ) {
		return <span>{ __( 'All repositories' ) }</span>;
	} else if ( repos.length === 1 ) {
		return (
			<div className="github-deployments-account__repository-access">
				<span>{ __( '1 repository' ) }</span>
				<span className="github-deployments-account__repositories">{ repos[ 0 ] }</span>
			</div>
		);
	}
	return (
		<div className="github-deployments-account__repository-access">
			<span>
				{ ' ' }
				{ repos.length } { __( ' repositories' ) }
			</span>
			<span className="github-deployments-account__repositories">{ repos.join( ', ' ) }</span>
		</div>
	);
}

export const GitHubAccountListItem = ( props: GitHubAccountListItemProps ) => {
	const { connection } = props;
	const { installation } = connection;
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );

	// Using ReactQuery to manage `isDisconnecting` state because it's not exposed from the Redux store.
	const mutation = useMutation< unknown, unknown, GitHubConnection >( {
		mutationFn: async ( connection ) => {
			dispatch( recordTracksEvent( 'calypso_github_deployments_disconnect_account_click' ) );
			await dispatch( deleteStoredKeyringConnection( connection ) );
			await queryClient.invalidateQueries( {
				queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, siteId, GITHUB_CONNECTION_QUERY_KEY ],
			} );
		},
	} );
	const { mutate: disconnect, isPending: isDisconnecting } = mutation;

	return (
		<tr>
			<td>
				<div className="github-deployments-account__details">
					{ installation.avatar_url && (
						<Image
							style={ { maxHeight: 24 } } //stop flashing off larger image
							className="github-deployments-account__profile-picture"
							src={ installation.avatar_url }
						/>
					) }
					@{ installation.login }
				</div>
			</td>
			<td> { getRepositoryAccess( connection ) }</td>
			<td>1st Feb 2024</td>
			<td>
				{ isDisconnecting ? (
					<Spinner />
				) : (
					<EllipsisMenu position="bottom right">
						<PopoverMenuItem
							itemComponent={ ExternalLink }
							href={ getConfigureURL( connection ) }
							target="_blank"
						>
							{ translate( 'Configure on GitHub' ) }
						</PopoverMenuItem>
						<PopoverMenuSeparator />
						<PopoverMenuItem
							itemComponent={ Button }
							className="github-deployments-account__menu-item-danger"
							busy={ isDisconnecting }
							disabled={ isDisconnecting }
							onClick={ () => disconnect( connection ) }
						>
							{ translate( 'Disconnect account' ) }
						</PopoverMenuItem>
					</EllipsisMenu>
				) }
			</td>
		</tr>
	);
};
