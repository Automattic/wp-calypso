import { isEnabled } from '@automattic/calypso-config';
import { Button, Card } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading/index';
import { getSelectedSiteId } from 'calypso/state/ui/selectors/index';
import iconGitHub from './github.svg';

import './style.scss';

export const GithubAuthorizeCard = () => {
	const siteId = useSelector( getSelectedSiteId );

	if ( ! isEnabled( 'hosting/github-integration' ) ) {
		return null;
	}
	return (
		<Card className="github-authorize-card">
			<img className="github-icon" src={ iconGitHub } alt="" />
			<CardHeading>{ translate( 'Connect GitHub' ) }</CardHeading>
			<p>
				{ translate(
					'Connect this site to a GitHub repository, choose a branch, and deploy with each push.'
				) }
			</p>
			<Button
				className="is-primary"
				href={ `https://public-api.wordpress.com/rest/v1.2/github-authorize-redirect?siteId=${ siteId }` }
			>
				{ translate( 'Authorize' ) }
			</Button>
		</Card>
	);
};
