import { Button } from '@automattic/components';
import { __ } from '@wordpress/i18n';

import './style.scss';

interface GitHubAuthorizeProps {
	buttonText?: string;
}

const isAuthorizing = false;

export const GitHubAuthorizeButton = ( props: GitHubAuthorizeProps ) => {
	const { buttonText = __( 'Authorize access to GitHub' ) } = props;

	function authoriseGitHub() {
		//coming soon
	}

	return (
		<Button primary busy={ isAuthorizing } disabled={ isAuthorizing } onClick={ authoriseGitHub }>
			{ buttonText }
		</Button>
	);
};
