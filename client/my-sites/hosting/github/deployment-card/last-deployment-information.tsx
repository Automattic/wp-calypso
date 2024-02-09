import i18n, { useTranslate } from 'i18n-calypso';
import { DeploymentStatusBadge } from './deployment-status-badge';
import { DeploymentStatusExplanation } from './deployment-status-explanation';
import { DeploymentData } from './use-deployment-status-query';

import './style.scss';

interface LastDeploymentInformationProps {
	deployment: DeploymentData;
	connectedRepo: string;
	connectionId: number;
}

export const LastDeploymentInformation = ( {
	deployment,
	connectedRepo,
	connectionId,
}: LastDeploymentInformationProps ) => {
	const translate = useTranslate();

	const totalFailures = deployment.move_failures?.length + deployment.remove_failures?.length;
	const deploymentTime = new Intl.DateTimeFormat( i18n.getLocaleSlug() ?? 'en', {
		dateStyle: 'medium',
		timeStyle: 'short',
	} ).format( new Date( deployment.last_deployment_timestamp * 1000 ) );

	const deploymentRepo = deployment.last_deployment_repo;
	const deploymentRepoLink = `https://github.com/${ deploymentRepo }`;

	return (
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
						href={ `${ deploymentRepoLink }/commit/${ deployment.last_deployment_sha }` }
						rel="noreferrer"
					>
						{ deployment.last_deployment_sha.substring( 0, 7 ) }
					</a>
				</div>
				<div className="deployment-card__column" style={ { flexDirection: 'row', gap: '8px' } }>
					<DeploymentStatusBadge status={ deployment.status } totalFailures={ totalFailures } />
				</div>
			</div>
			{ deploymentRepo !== connectedRepo && (
				<div className="deployment-card__row">
					<div className="deployment-card__column">
						<span className="deployment-card__different-repo-notice">
							{ translate(
								'This commit belongs to a different repository: {{repoLink}}%(deploymentRepo)s{{/repoLink}}',
								{
									args: {
										deploymentRepo,
									},
									components: {
										repoLink: <a href={ deploymentRepoLink } />,
									},
								}
							) }
						</span>
					</div>
				</div>
			) }
			{ ( deployment.status === 'failed' || totalFailures > 0 ) && (
				<DeploymentStatusExplanation
					status={ deployment.status }
					totalFailures={ totalFailures }
					connectionId={ connectionId }
					deploymentTimestamp={ deployment.last_deployment_timestamp }
				/>
			) }
		</div>
	);
};
