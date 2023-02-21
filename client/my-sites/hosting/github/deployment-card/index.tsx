import { Button, Card, Spinner } from '@automattic/components';
import i18n, { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import SocialLogo from 'calypso/components/social-logo';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { DeploymentStatusBadge } from './deployment-status-badge';
import { DeploymentStatusExplanation } from './deployment-status-explanation';
import { useDeploymentStatus } from './use-deployment-status';

import './style.scss';

type DeploymentCardProps = {
	repo: string;
	branch: string;
	repoUrl: string;
};
export const DeploymentCard = ( { repo, branch }: DeploymentCardProps ) => {
	let deploymentTime = '';
	let totalFailures = 0;

	const siteId = useSelector( getSelectedSiteId );

	const { data: deployment, isLoading } = useDeploymentStatus( siteId );
	const translate = useTranslate();

	if ( deployment ) {
		totalFailures = deployment.move_failures.length + deployment.remove_failures.length;
		deploymentTime = new Intl.DateTimeFormat( i18n.getLocaleSlug() ?? 'en', {
			dateStyle: 'medium',
			timeStyle: 'short',
		} ).format( new Date( deployment.last_deployment_timestamp * 1000 ) );
	}

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
							a: <a target="_blank" href={ `https://github.com/${ repo }` } rel="noreferrer" />,
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
									href={ `https://github.com/${ repo }/${ deployment.last_deployment_sha }` }
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
			<Button primary>
				<span>{ translate( 'Disconnect repository' ) }</span>
			</Button>
		</Card>
	);
};
