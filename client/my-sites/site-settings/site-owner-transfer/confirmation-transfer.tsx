import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect } from 'react';
import { LoadingBar } from 'calypso/components/loading-bar';
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
	const { confirmTransfer } = useConfirmTransfer(
		{ siteId },
		{
			onSuccess: () => {
				page.redirect( `/sites?site-transfer-confirm=true` );
			},
		}
	);
	useEffect( () => {
		confirmTransfer( confirmationHash );
	}, [ confirmTransfer, confirmationHash ] );
	return (
		<>
			<LoadingBar key="transfer-site-loading-bar" progress={ progress } />
			<p>{ translate( 'We are transferring your site.' ) }</p>
		</>
	);
}
