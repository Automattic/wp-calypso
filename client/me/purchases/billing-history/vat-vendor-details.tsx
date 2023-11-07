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
				{ translate( 'Vendor %(taxName)s Details', {
					args: { taxName: vendorInfo.tax_name },
					comment: 'taxName is a localized tax, like VAT or GST',
				} ) }
			</strong>
			<span>
				{ vendorInfo.address.map( ( addressLine ) => (
					<div key={ addressLine }>{ addressLine }</div>
				) ) }
			</span>
			{ vendorInfo.tax_name_and_vendor_id_object && (
				<span className="receipt__vat-vendor-details-number">
					<strong>{ vendorInfo.tax_name }</strong> { vendorInfo.vat_id }
				</span>
			) }
		</li>
	);
}
