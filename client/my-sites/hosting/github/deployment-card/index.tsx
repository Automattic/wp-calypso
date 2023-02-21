import { Button, Card, Spinner } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import i18n, { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import SocialLogo from 'calypso/components/social-logo';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { DeploymentStatusBadge } from './deployment-status-badge';
import { DeploymentStatusExplanation } from './deployment-status-explanation';
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
	let deploymentTime = '';
	let totalFailures = 0;

	const siteId = useSelector( getSelectedSiteId );

	const { data: deployment, isLoading } = useDeploymentStatusQuery( siteId, connectionId );
	const translate = useTranslate();

	if ( deployment ) {
		totalFailures = deployment.move_failures.length + deployment.remove_failures.length;
		deploymentTime = new Intl.DateTimeFormat( i18n.getLocaleSlug() ?? 'en', {
			dateStyle: 'medium',
			timeStyle: 'short',
		} ).format( new Date( deployment.last_deployment_timestamp * 1000 ) );
	}

	const dispatch = useDispatch();

	const { disconnectRepo, isLoading: isDisconnecting } = useGithubDisconnectRepoMutation( siteId, {
		onSuccess: () => {
			dispatch( successNotice( translate( 'Disconnected from repository successfully' ) ) );
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
	} );

	return (
		<Card>
			<SocialLogo className="material-icon" icon="github" size={ 32 } />
			<CardHeading className="deployment-card__heading">
				{ translate( 'Deploy from GitHub' ) }
			</CardHeading>
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
				{ deployment && (
					<div style={ { marginBottom: '24px' } }>
						<strong style={ { display: 'block', marginBottom: '8px' } }>
							{ translate( 'Last deployment' ) }
						</strong>
						<div className="deployment-card__row">
							<div className="deployment-card__column">
								<span>{ deploymentTime }</span>
							</div>
							<div className="deployment-card__column">
								<a
									target="_blank"
									href={ `https://github.com/${ repo }/commit/${ deployment.last_deployment_sha }` }
									rel="noreferrer"
								>
									{ deployment.last_deployment_sha.substring( 0, 7 ) }
								</a>
							</div>
							<div
								className="deployment-card__column"
								style={ { flexDirection: 'row', gap: '8px' } }
							>
								<DeploymentStatusBadge
									status={ deployment.status }
									totalFailures={ totalFailures }
								/>
							</div>
						</div>
						{ ( deployment.status === 'failed' || totalFailures > 0 ) && (
							<DeploymentStatusExplanation
								status={ deployment.status }
								totalFailures={ totalFailures }
							/>
						) }
					</div>
				) }
			</div>
			<Button primary busy={ isDisconnecting } onClick={ () => disconnectRepo( siteId ) }>
				<span>{ translate( 'Disconnect repository' ) }</span>
			</Button>
		</Card>
	);
};
