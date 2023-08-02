import { Button, Card, Spinner } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { GitHubCardHeading } from '../github-card-heading';
import { EmptyDeployments } from './empty-deployments';
import { LastDeploymentInformation } from './last-deployment-information';
import { useDeploymentStatusQuery } from './use-deployment-status-query';
import { useGithubDisconnectRepoMutation } from './use-disconnect-repo';

import './style.scss';

type DeploymentCardProps = {
	repo: string;
	branch: string;
	connectionId: number;
};
const noticeOptions = {
	duration: 3000,
};

export const DeploymentCard = ( { repo, branch, connectionId }: DeploymentCardProps ) => {
	const siteId = useSelector( getSelectedSiteId );

	const { data: deployment, isLoading } = useDeploymentStatusQuery( siteId, connectionId );
	const translate = useTranslate();

	const dispatch = useDispatch();

	const { disconnectRepo, isLoading: isDisconnecting } = useGithubDisconnectRepoMutation(
		siteId,
		connectionId,
		{
			onSuccess: () => {
				dispatch( successNotice( translate( 'Repository disconnected.' ), noticeOptions ) );
			},
			onError: ( error ) => {
				dispatch(
					errorNotice(
						// translators: "reason" is why disconnecting the branch failed.
						sprintf( translate( 'Failed to disconnect: %(reason)s' ), { reason: error.message } ),
						{
							...noticeOptions,
						}
					)
				);
			},
			onSettled: ( _, error ) => {
				dispatch(
					recordTracksEvent( 'calypso_hosting_github_disconnect_complete', {
						disconnected: ! error,
					} )
				);
			},
		}
	);

	return (
		<Card>
			<GitHubCardHeading />
			<div>
				<p>
					{ translate( 'Listening for pushes from {{a}}%(repo)s{{/a}}.', {
						args: {
							repo: `${ repo } (${ branch })`,
						},
						components: {
							a: (
								<a
									target="_blank"
									href={ `https://github.com/${ repo }/tree/${ branch }` }
									rel="noreferrer"
								/>
							),
						},
					} ) }
				</p>
			</div>
			<div>
				{ isLoading && <Spinner /> }
				{ ! isLoading && deployment && (
					<LastDeploymentInformation
						deployment={ deployment }
						connectedRepo={ repo }
						connectionId={ connectionId }
					/>
				) }
				{ ! isLoading && ! deployment && <EmptyDeployments /> }
			</div>
			<Button
				primary
				busy={ isDisconnecting }
				onClick={ () => {
					dispatch( recordTracksEvent( 'calypso_hosting_github_disconnect_click' ) );
					disconnectRepo( siteId );
				} }
			>
				<span>{ translate( 'Disconnect repository' ) }</span>
			</Button>
		</Card>
	);
};
