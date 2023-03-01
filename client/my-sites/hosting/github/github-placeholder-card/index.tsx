import { Card, Spinner } from '@automattic/components';
import { GitHubCardHeading } from '../github-card-heading';

import '../style.scss';

export const GitHubPlaceholderCard = () => {
	return (
		<Card className="github-hosting-card">
			<GitHubCardHeading />
			<Spinner />
		</Card>
	);
};
