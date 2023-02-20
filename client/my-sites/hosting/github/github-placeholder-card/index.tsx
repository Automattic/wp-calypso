import { Card, Spinner } from '@automattic/components';
import { translate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import SocialLogo from 'calypso/components/social-logo';

import '../style.scss';

export const GitHubPlaceholderCard = () => {
	return (
		<Card className="github-hosting-card">
			<SocialLogo className="material-icon" icon="github" size={ 32 } />
			<CardHeading>{ translate( 'Deploy from GitHub' ) }</CardHeading>
			<Spinner />
		</Card>
	);
};
