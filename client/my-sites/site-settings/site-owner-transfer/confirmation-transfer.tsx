import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { SiteTransferringLoadingCard } from 'calypso/my-sites/site-settings/site-owner-transfer/site-transferring-loading-card';
import { useConfirmTransfer } from './use-confirm-transfer';

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
	const [ error, setError ] = useState< { message?: string } | null >( null );
	const { confirmTransfer } = useConfirmTransfer(
		{ siteId },
		{
			onSuccess: () => {
				page.redirect( `/sites?site-transfer-confirm=true` );
			},
			onError: ( error ) => {
				setError( error as Error );
			},
		}
	);
	useEffect( () => {
		confirmTransfer( confirmationHash );
	}, [ confirmTransfer, confirmationHash ] );

	const customError = translate(
		'There was an error confirming the site transfer. Please {{link}}contact our support team{{/link}} for help.',
		{
			components: {
				link: <a href="/help" />,
			},
		}
	);

	return (
		<SiteTransferringLoadingCard
			progress={ progress }
			error={ error ? customError : '' }
		></SiteTransferringLoadingCard>
	);
}
