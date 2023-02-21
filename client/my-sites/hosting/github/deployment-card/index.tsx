import { Button, Card } from '@automattic/components';
import { PanelBody } from '@wordpress/components';
import i18n, { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import Badge from 'calypso/components/badge';
import CardHeading from 'calypso/components/card-heading';
import SocialLogo from 'calypso/components/social-logo';

import './style.scss';
const mockData = {
	status: 'success',
	move_failures: [],
	remove_failures: [],
	log_file_url:
		'https://fseeeee.wpcomstaging.com/wp-content/uploads/2023/02/github-deployment-zaguiini-wpcom-github-test_2f597fe3041798c3f251b1533efb258408a396d5_1676928272.txt',
	last_deployment_timestamp: 1676928273,
	last_deployment_sha: '2f597fe3041798c3f251b1533efb258408a396d5',
};

type DeploymentCardProps = {
	repo: string;
	branch: string;
	repoUrl: string;
};
export const DeploymentCard = ( { repo, branch, repoUrl }: DeploymentCardProps ) => {
	const translate = useTranslate();

	const totalFailures = mockData.move_failures.length + mockData.remove_failures.length;
	const deploymentTime = new Intl.DateTimeFormat( i18n.getLocaleSlug() ?? 'en', {
		dateStyle: 'medium',
		timeStyle: 'medium',
	} ).format( new Date( mockData.last_deployment_timestamp * 1000 ) );

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
				<PanelBody title={ translate( 'Recent Deployment' ) } initialOpen={ false }>
					<div className="deployment-card__row">
						<div className="deployment-card__column">
							<p>{ moment( deploymentTime ).fromNow() }</p>
						</div>
						<div className="deployment-card__column">
							<p>
								{ translate( 'commit {{a}}%(commit)s{{/a}}', {
									args: {
										commit: mockData.last_deployment_sha.substring( 0, 7 ),
									},
									components: {
										a: <a target="_blank" href={ repoUrl } rel="noreferrer" />,
									},
								} ) }
							</p>
						</div>
					</div>
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
