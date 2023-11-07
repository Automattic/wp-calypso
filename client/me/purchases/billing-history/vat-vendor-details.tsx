import { useTranslate } from 'i18n-calypso';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

export function VatVendorDetails( { transaction }: { transaction: BillingTransaction } ) {
	const translate = useTranslate();
	const vendorInfo = transaction.tax_vendor_info;
	if ( ! vendorInfo ) {
		return null;
	}

	// We need a combined string of the object properties for the combinedTaxName in the vendor info header
	const vendorInfoCombinedTaxName = Object.keys( vendorInfo.tax_name_and_vendor_id_object ).join( '/' );

	// We need to create a string of the taxName and taxID that contains each combination
	// const vendorInfoTaxNamesAndIDs = Object.keys(vendorInfo.tax_name_and_vendor_id_object).map(function(taxName, taxID) {
	// 	return '<strong>'+taxName+'</strong> '+taxID+' <br />';
	// });

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
			{ /* <span className="receipt__vat-vendor-details-number">
				{ vendorInfoTaxNamesAndIDs }
				</span> */ }
		</li>
	);
}
