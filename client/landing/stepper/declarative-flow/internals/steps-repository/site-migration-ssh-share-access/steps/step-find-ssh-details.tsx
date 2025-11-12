import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FC, ReactNode } from 'react';

interface StepFindSSHDetailsProps {
	onSuccess: () => void;
	onNoSSHAccess?: () => void;
	hostDisplayName?: string;
	helpLink: ReactNode;
	isInputDisabled: boolean;
}

export const StepFindSSHDetails: FC< StepFindSSHDetailsProps > = ( {
	onSuccess,
	onNoSSHAccess,
	hostDisplayName,
	helpLink,
	isInputDisabled,
} ) => {
	const translate = useTranslate();

	const instructionText = hostDisplayName
		? translate(
				"Go to your %(currentHost)s WordPress site's settings, enable SSH, and take note of your details.",
				{
					args: { currentHost: hostDisplayName },
				}
		  )
		: translate(
				"Go to your hosting provider's dashboard, enable SSH access for your WordPress site, and take note of your SSH details."
		  );

	return (
		<div>
			<p>{ instructionText }</p>
			{ helpLink }
			<div className="migration-site-ssh__find-ssh-details-buttons">
				<Button variant="primary" onClick={ onSuccess }>
					{ translate( 'I found my SSH details' ) }
				</Button>
				<Button
					variant="link"
					onClick={ onNoSSHAccess }
					className="migration-site-ssh__no-ssh-link"
					disabled={ isInputDisabled }
				>
					{ translate( "I don't have SSH" ) }
				</Button>
			</div>
		</div>
	);
};
