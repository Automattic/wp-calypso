import { useTranslate } from 'i18n-calypso';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

interface VatVendorInfo {
	/**
	 * The country code for this info.
	 */
	country: string;

	/**
	 * The localized name of the tax (eg: "VAT", "GST", etc.).
	 */
	taxName: string;

	/**
	 * The mailing address to display on receipts.
	 */
	address: string[];

	/**
	 * The vendor's VAT id.
	 */
	vatId: string;
}

function getVatVendorInfo(
	country: string,
	translate: ReturnType< typeof useTranslate >
): VatVendorInfo | undefined {
	// TODO: add more countries

	if ( country === 'CA' ) {
		return {
			country: 'CA',
			taxName: translate( 'GST', { textOnly: true } ),
			address: [
				'Aut O’Mattic Ltd.',
				'c/o Noone Casey',
				'Grand Canal Dock, 25 Herbert Pl',
				'Dublin, D02 AY86',
				'Ireland',
			],
			vatId: '790004303',
		};
	}

	return undefined;
}

export function VatVendorDetails( { transaction }: { transaction: BillingTransaction } ) {
	const translate = useTranslate();
	const vendorInfo = getVatVendorInfo( transaction.tax_country_code, translate );
	if ( ! vendorInfo ) {
		return null;
	}

	return (
		<li>
			<strong>{ translate( 'Vendor VAT Details' ) }</strong>
			<span>
				{ vendorInfo.address.map( ( addressLine ) => (
					<>
						{ addressLine }
						<br />
					</>
				) ) }
			</span>
			<span className="receipt__vat-vendor-details-number">
				<strong>{ vendorInfo.taxName }</strong> { vendorInfo.vatId }
			</span>
		</li>
	);
}
