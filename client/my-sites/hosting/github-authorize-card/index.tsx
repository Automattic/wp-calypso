import { Button, Card } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading/index';
import { getSelectedSiteId } from 'calypso/state/ui/selectors/index';
import iconGitHub from './github.svg';

import './style.scss';

export const GithubAuthorizeCard = () => {
	const siteId = useSelector( getSelectedSiteId );
	return (
		<Card className="github-authorize-card">
			<div className="github-authorize-card__header">
				<img className="github-icon" src={ iconGitHub } alt="" />
				<CardHeading>{ translate( 'Connect GitHub' ) }</CardHeading>
			</div>
			<div>
				<p>{ translate( 'Connect to a GitHub repository and branch and deploy directly.' ) }</p>
			</div>
			<Button
				className="is-primary"
				href={ `https://public-api.wordpress.com/rest/v1.2/github-authorize-redirect?siteId=${ siteId }` }
			>
				{ translate( 'Authorize' ) }
			</Button>
		</Card>
	);
};
