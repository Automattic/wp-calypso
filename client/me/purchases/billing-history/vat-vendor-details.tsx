import { useTranslate } from 'i18n-calypso';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

export function VatVendorDetails( { transaction }: { transaction: BillingTransaction } ) {
	const translate = useTranslate();
	const vendorInfo = transaction.tax_vendor_info;
	if ( ! vendorInfo ) {
		return null;
	}

	return (
		<li>
			<strong>
				{ translate( 'Vendor %(combinedTaxName)s Details', {
					args: { combinedTaxName: vendorInfoCombinedTaxName },
					comment: 'combinedTaxName is a localized tax, like VAT or GST',
				} ) }
			</strong>
			<span>
				{ vendorInfo.address.map( ( addressLine ) => (
					<div key={ addressLine }>{ addressLine }</div>
				) ) }
			</span>
			{ <span className="receipt__vat-vendor-details-number">
				{ vendorInfoTaxNamesAndIDs }
				</span> }
		</li>
	);
}
