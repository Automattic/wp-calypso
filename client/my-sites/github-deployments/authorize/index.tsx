import { Card } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { GitHubAuthorizeButton } from './authorize-button';

import './style.scss';

export const GitHubAuthorize = () => {
	return (
		<Card className="github-deployments-authorize-card">
			<p>{ __( 'To create or connect repositories, begin by authorizing GitHub.' ) }</p>
			<GitHubAuthorizeButton />
		</Card>
	);
};
