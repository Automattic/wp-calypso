import { useI18n } from '@wordpress/react-i18n';
import PurchaseDetail from 'calypso/components/purchase-detail';

const BulkDomainTransferFooter = () => {
	const { __ } = useI18n();

	return (
		<div>
			<PurchaseDetail
				title={ __( 'Want to speed this up?' ) }
				description={ __(
					'Check your inbox for an email from your current domain provider for instructions on how to speed up the transfer process.'
				) }
				buttonText={ null }
				href={ null }
				onClick={ null }
			/>
			<PurchaseDetail
				title={ __( 'Will my email continue to work?' ) }
				description={ __(
					"We'll automatically import any MX, TXT, and A records for your domain, so your email will transfer seamlessly."
				) }
				buttonText={ null }
				href={ null }
				onClick={ null }
			/>
		</div>
	);
};

export default BulkDomainTransferFooter;
