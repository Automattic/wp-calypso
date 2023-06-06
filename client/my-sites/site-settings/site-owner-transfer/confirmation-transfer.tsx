import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState } from 'react';
import { LoadingBar } from 'calypso/components/loading-bar';
import Notice from 'calypso/components/notice';
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
	return error ? (
		<Notice status="is-error" showDismiss={ false }>
			<div data-testid="error">
				<p>
					{ translate( 'There was an error confirming the site transfer.' ) }
					{ error.message && ` ${ error.message }` }
				</p>
			</div>
		</Notice>
	) : (
		<>
			<LoadingBar key="transfer-site-loading-bar" progress={ progress } />
			<p>{ translate( 'We are transferring your site.' ) }</p>
		</>
	);
}
