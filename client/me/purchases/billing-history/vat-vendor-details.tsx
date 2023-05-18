import { useTranslate } from 'i18n-calypso';
import useCountryList from 'calypso/my-sites/checkout/composite-checkout/hooks/use-country-list';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

export function useVatVendorInfo( countryCode: string ) {
	const countryList = useCountryList();
	const country = countryList.find( ( country ) => country.code === countryCode );
	return country?.tax_vendor_info;
}

export function VatVendorDetails( { transaction }: { transaction: BillingTransaction } ) {
	const translate = useTranslate();
	const vendorInfo = useVatVendorInfo( transaction.tax_country_code );
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
			<span className="receipt__vat-vendor-details-number">
				<strong>{ vendorInfo.tax_name }</strong> { vendorInfo.vat_id }
			</span>
		</li>
	);
}
