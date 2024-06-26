import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';

export type ThankYouGoogleWorkspaceProductProps = {
	productFamily: string;
	numberOfMailboxesPurchased?: number;
	domainName: string;
	siteSlug?: string;
};

export function ThankYouGoogleWorkspaceProduct( {
	productFamily,
	domainName,
	numberOfMailboxesPurchased,
	siteSlug,
}: ThankYouGoogleWorkspaceProductProps ) {
	const translate = useTranslate();
	const emailManagementPath = getEmailManagementPath( siteSlug, domainName );

	let details;
	if ( numberOfMailboxesPurchased && numberOfMailboxesPurchased > 1 ) {
		details = translate( '%(quantity)s mailboxes for %(domainName)s', {
			args: { quantity: numberOfMailboxesPurchased, domainName },
		} );
	} else {
		details = translate( 'Mailbox for %(domainName)s', {
			args: { domainName },
		} );
	}

	const actions = [
		<Button variant="primary" href={ emailManagementPath } key="manage-email">
			{ translate( 'Manage email' ) }
		</Button>,
	];

	return (
		<ThankYouProduct
			name={ productFamily }
			key={ productFamily + domainName }
			details={ details }
			actions={ actions }
		/>
	);
}
