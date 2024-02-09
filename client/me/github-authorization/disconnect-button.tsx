import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { Connection } from 'calypso/lib/github/use-github-authorization-query';
import { useGitHubDeauthorizeMutation } from 'calypso/lib/github/use-github-deauthorize-mutation';

import './style.scss';

interface DisconnectGitHubButtonProps {
	connection: Connection;
}

export function DisconnectGitHubButton( { connection }: DisconnectGitHubButtonProps ) {
	const { deauthorize, isDeauthorizing } = useGitHubDeauthorizeMutation();
	const { __ } = useI18n();

	return (
		<Button
			scary
			primary
			onClick={ () => deauthorize( connection ) }
			busy={ isDeauthorizing }
			disabled={ isDeauthorizing } // `busy` doesn't actually disable the button
		>
			{ __( 'Disconnect' ) }
		</Button>
	);
}
