import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { LoadingBar } from 'calypso/components/loading-bar';
import Notice from 'calypso/components/notice';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useConfirmTransfer } from './use-confirm-transfer';

type SiteTransferResponse = {
	transfer?: boolean;
	email_sent?: boolean;
};

/**
 * Component to display the confirmation of the site transfer when the new owner clicks on the link in the email.
 * The confirmation hash. That URL is provided in the email.
 */
export function ConfirmationTransfer( {
	siteId,
	confirmationHash,
}: {
	siteId: number;
	confirmationHash: string;
} ) {
	const translate = useTranslate();
	const progress = 0.3;
	const [ isEmailSent, setIsEmailSent ] = useState< boolean >( false );
	const [ error, setError ] = useState< { message?: string } | null >( null );
	const { confirmTransfer } = useConfirmTransfer(
		{ siteId },
		{
			onSuccess: ( data ) => {
				const { transfer, email_sent } = data as SiteTransferResponse;

				if ( transfer ) {
					recordTracksEvent( 'calypso_site_owner_transfer_confirm_success' );
					page.redirect( `/sites?site-transfer-confirm=true` );
				} else if ( email_sent ) {
					recordTracksEvent( 'calypso_site_owner_transfer_pending_invitation_sent' );
					setIsEmailSent( true );
				}
			},
			onError: ( error ) => {
				setError( error as Error );
			},
		}
	);
	useEffect( () => {
		confirmTransfer( confirmationHash );
	}, [ confirmTransfer, confirmationHash ] );

	if ( isEmailSent ) {
		return (
			<Notice status="is-success" showDismiss={ false }>
				<div data-testid="email-sent">
					<p>
						{ translate(
							'We have sent an email to the new site owner to accept the site transfer. They will need to click the link in the email to complete the transfer. The link in email will expire in 7 days.'
						) }
					</p>
				</div>
			</Notice>
		);
	}

	if ( error ) {
		return (
			<Notice status="is-error" showDismiss={ false }>
				<div data-testid="error">
					<p>
						{ translate(
							'There was an error confirming the site transfer. Please {{link}}contact our support team{{/link}} for help.',
							{
								components: {
									link: <a href="/help" />,
								},
							}
						) }
					</p>
				</div>
			</Notice>
		);
	}

	return (
		<>
			<p>
				<LoadingBar key="transfer-site-loading-bar" progress={ progress } />
			</p>
			<p>{ translate( 'We are transferring your site.' ) }</p>
		</>
	);
}
