import { Card, Spinner } from '@automattic/components';
import { translate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading/index';
import iconGitHub from '../github.svg';

import '../style.scss';

export const GitHubPlaceholderCard = () => {
	return (
		<Card className="github-hosting-card">
			<img className="github-hosting-icon" src={ iconGitHub } alt="" />
			<CardHeading>{ translate( 'GitHub' ) }</CardHeading>
			<Spinner />
		</Card>
	);
};
