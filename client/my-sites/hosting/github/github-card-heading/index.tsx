import { Badge } from '@automattic/components';
import { translate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import SocialLogo from 'calypso/components/social-logo';
import './style.scss';

export function GitHubCardHeading() {
	return (
		<>
			<SocialLogo className="material-icon" icon="github" size={ 32 } />
			{ /* Element ID allows direct linking from the /sites page */ }
			<CardHeading id="connect-github">
				{ translate( 'Deploy from GitHub' ) }
				<Badge className="github-hosting-heading-badge" type="info">
					{ translate( 'beta' ) }
				</Badge>
			</CardHeading>
		</>
	);
}
