import { Card } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { GitHubAuthorizeButton } from '../authorize-button';

import './style.scss';

export const GitHubAuthorizeCard = () => {
	return (
		<Card css={ { display: 'flex', flexDirection: 'column', alignItems: 'center' } }>
			<p>{ __( 'To create or connect repositories, begin by authorizing GitHub.' ) }</p>
			<GitHubAuthorizeButton />
		</Card>
	);
};
