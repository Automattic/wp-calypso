import { Button, Card, Spinner } from '@automattic/components';
import { PanelBody } from '@wordpress/components';
import i18n, { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useSelector } from 'react-redux';
import Badge from 'calypso/components/badge';
import CardHeading from 'calypso/components/card-heading';
import SocialLogo from 'calypso/components/social-logo';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useDeploymentStatus } from './use-deployment-status';
import './style.scss';

type DeploymentCardProps = {
	repo: string;
	branch: string;
	repoUrl: string;
};
export const DeploymentCard = ( { repo, branch, repoUrl }: DeploymentCardProps ) => {
	let deploymentTime = '';
	let totalFailures = 0;

	const siteId = useSelector( getSelectedSiteId );

	const { data: deployment, isLoading } = useDeploymentStatus( siteId );
	const translate = useTranslate();

	if ( deployment ) {
		totalFailures = deployment.move_failures.length + deployment.remove_failures.length;
		deploymentTime = new Intl.DateTimeFormat( i18n.getLocaleSlug() ?? 'en', {
			dateStyle: 'medium',
			timeStyle: 'medium',
		} ).format( new Date( deployment.last_deployment_timestamp * 1000 ) );
	}

	return (
		<Card>
			<SocialLogo className="material-icon" icon="github" size={ 32 } />
			<CardHeading className="deployment-card__heading">
				{ translate( 'Deploy from GitHub' ) }
				<Badge type="info-green">{ translate( 'Deployed' ) }</Badge>
			</CardHeading>
			<div>
				<p>
					{ translate( 'Deploying from {{a}}%(repo)s{{/a}}', {
						args: {
							repo: `${ repo } (${ branch })`,
						},
						components: {
							a: <a target="_blank" href={ repoUrl } rel="noreferrer" />,
						},
					} ) }
				</p>
			</div>
			<div>
				<PanelBody title={ translate( 'Recent Deployment' ) } opened>
					{ isLoading && <Spinner /> }
					{ ! isLoading && ! deployment && <p>translate('There are no deployments')</p> }

					{ deployment && (
						<div className="deployment-card__row">
							<div className="deployment-card__column">
								<p>{ moment( deploymentTime ).fromNow() }</p>
							</div>
							<div className="deployment-card__column">
								<p>
									{ translate( 'commit {{a}}%(commit)s{{/a}}', {
										args: {
											commit: deployment?.last_deployment_sha.substring( 0, 7 ),
										},
										components: {
											a: <a target="_blank" href={ repoUrl } rel="noreferrer" />,
										},
									} ) }
								</p>
							</div>
						</div>
					) }
					{ totalFailures > 0 && (
						<p>
							{ translate(
								'%(totalFailures)s file failed to transfer.',
								'%(totalFailures)s files failed to transfer.',
								{
									count: totalFailures,
									args: {
										totalFailures,
									},
								}
							) }{ ' ' }
							<a target="_blank" href={ repoUrl } rel="noreferrer">
								{ translate( 'Check logs' ) }
							</a>
						</p>
					) }
				</PanelBody>
			</div>
			<Button primary style={ { marginTop: '16px' } }>
				<span>{ translate( 'Disconnect repository' ) }</span>
			</Button>
		</Card>
	);
};
