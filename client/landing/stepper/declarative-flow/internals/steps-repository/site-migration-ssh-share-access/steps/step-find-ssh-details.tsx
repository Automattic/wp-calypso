import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { HelpLink } from './help-link';
import { getSSHSupportUrl, getSSHHostDisplayName } from './ssh-host-support-urls';

interface StepFindSSHDetailsProps {
	onSuccess: () => void;
	onNoSSHAccess?: () => void;
	host?: string;
}

export const StepFindSSHDetails: FC< StepFindSSHDetailsProps > = ( {
	onSuccess,
	onNoSSHAccess,
	host,
} ) => {
	const translate = useTranslate();
	const hostDisplayName = getSSHHostDisplayName( host );

	const instructionText = hostDisplayName
		? translate(
				"Go to your %(currentHost)s WordPress site's settings, enable SSH, and take note of your details.",
				{
					args: { currentHost: hostDisplayName },
				}
		  )
		: translate(
				"Go to your hosting provider's control panel, enable SSH access for your WordPress site, and take note of your SSH details (hostname, port, username, and authentication method)."
		  );

	return (
		<div>
			<p>{ instructionText }</p>
			<HelpLink href={ getSSHSupportUrl( host ) } />
			<div className="migration-site-ssh__find-ssh-details-buttons">
				<Button variant="primary" onClick={ onSuccess }>
					{ translate( 'I found my SSH details' ) }
				</Button>
				<Button variant="link" onClick={ onNoSSHAccess }>
					{ translate( "I don't have SSH access" ) }
				</Button>
			</div>
		</div>
	);
};
