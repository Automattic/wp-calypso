import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

interface Props {
	domain: string;
	isVisible: boolean;
	onClose(): void;
	onContinue(): void;
}

export function recordUnverifiedDomainDialogShownTracksEvent( site_id?: number ) {
	recordTracksEvent( 'calypso_launchpad_unverified_domain_email_dialog_shown', {
		site_id,
	} );
}

export function recordUnverifiedDomainContinueAnywayClickedTracksEvent( site_id?: number ) {
	recordTracksEvent( 'calypso_launchpad_unverified_domain_email_continue_anyway_clicked', {
		site_id,
	} );
}

export const UnverifiedDomainEmailNagDialog = ( {
	domain,
	isVisible,
	onClose,
	onContinue,
}: Props ) => {
	const translate = useTranslate();

	return (
		<Dialog
			isVisible={ isVisible }
			buttons={ [
				{
					action: 'cancel',
					label: translate( 'Cancel' ),
				},
				{
					action: 'launch',
					label: translate( 'Continue anyway' ),
					isPrimary: true,
					onClick: onContinue,
				},
			] }
			onClose={ onClose }
		>
			<p>
				{ translate(
					'Your domain email address is still unverified. This will cause {{strong}}%(domain)s{{/strong}} to be suspended in the future.{{break/}}{{break/}}Please check your inbox for the ICANN verification email.',
					{
						components: {
							p: <p />,
							break: <br />,
							strong: <strong />,
						},
						args: { domain },
					}
				) }
			</p>
		</Dialog>
	);
};
