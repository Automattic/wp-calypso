import { Card } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { GitHubAuthorizeButton } from '../authorize-button';

import './style.scss';

export const GitHubAuthorizeCard = () => {
	return (
		<Card css={ { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32 } }>
			<p css={ { marginBottom: 28 } }>{ __( 'Continue with GitHub to get started' ) }</p>
			<GitHubAuthorizeButton />
		</Card>
	);
};
