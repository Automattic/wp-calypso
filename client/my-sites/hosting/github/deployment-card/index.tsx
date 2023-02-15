import { Button, Card } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import Badge from 'calypso/components/badge';
import CardHeading from 'calypso/components/card-heading';
import SocialLogo from 'calypso/components/social-logo';
import './style.scss';

type DeploymentCardProps = {
	repo: string;
	branch: string;
	repoUrl: string;
};
export const DeploymentCard = ( { repo, branch, repoUrl }: DeploymentCardProps ) => {
	return (
		<Card>
			<SocialLogo className="material-icon" icon="github" size={ 32 } />
			<CardHeading className="deployment-card__heading">
				{ __( 'Deploy from GitHub' ) }
				<Badge type="info-green">{ __( 'Deployed' ) }</Badge>
			</CardHeading>
			<div>
				<p>
					{ __( 'Deploying from ' ) }
					<a target="_blank" href={ repoUrl } rel="noreferrer">
						{ repo } ({ branch })
					</a>
				</p>
			</div>

			<Button primary>
				<span>{ __( 'Disconnect repository' ) }</span>
			</Button>
		</Card>
	);
};
