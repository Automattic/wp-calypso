import { translate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import SocialLogo from 'calypso/components/social-logo';

export function GitHubCardHeading() {
	return (
		<>
			<SocialLogo className="material-icon" icon="github" size={ 32 } />
			<CardHeading>{ translate( 'Deploy from GitHub' ) }</CardHeading>
		</>
	);
}
