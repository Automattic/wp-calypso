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
					args: {
						combinedTaxName: Object.keys( vendorInfo.tax_name_and_vendor_id_array ).join( '/' ),
					},
					comment: 'combinedTaxName is a localized tax, like VAT or GST',
				} ) }
			</strong>
			<span>
				{ vendorInfo.address.map( ( addressLine ) => (
					<div key={ addressLine }>{ addressLine }</div>
				) ) }
			</span>
			<span className="receipt__vat-vendor-details-number">
				{ Object.entries( vendorInfo.tax_name_and_vendor_id_array ).map( ( [ taxName, taxID ] ) => (
					<div key={ taxName }>
						<strong>{ taxName }</strong> { taxID }
					</div>
				) ) }
			</span>
		</li>
	);
}
