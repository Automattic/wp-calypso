import { useTranslate } from 'i18n-calypso';
import { isCountryInEu } from '../is-country-in-eu';
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

export function getVatVendorInfo(
	/**
	 * Two-letter country code.
	 */
	country: string,

	/**
	 * A string version of date that can be read by Date.parse.
	 *
	 * Can be 'now'.
	 */
	date: string,

	translate: ReturnType< typeof useTranslate >
): VatVendorInfo | undefined {
	const automatticVatAddress = [
		'Aut O’Mattic Ltd.',
		'c/o Noone Casey',
		'Grand Canal Dock, 25 Herbert Pl',
		'Dublin, D02 AY86',
		'Ireland',
	];

	if ( isCountryInEu( country, date ) ) {
		return {
			country,
			taxName: translate( 'VAT', { textOnly: true } ),
			address: automatticVatAddress,
			vatId: 'IE3255131SH',
		};
	}

	if ( country === 'AU' ) {
		return {
			country,
			taxName: translate( 'GST', { textOnly: true } ),
			address: automatticVatAddress,
			vatId: 'ARN: 3000 1650 1438',
		};
	}

	if ( country === 'CA' ) {
		return {
			country,
			taxName: translate( 'GST', { textOnly: true } ),
			address: automatticVatAddress,
			vatId: '790004303',
		};
	}

	if ( country === 'CH' ) {
		return {
			country,
			taxName: translate( 'GST', { textOnly: true } ),
			address: automatticVatAddress,
			vatId: 'CHE-259.584.214 MWST',
		};
	}

	if ( country === 'GB' ) {
		return {
			country,
			taxName: translate( 'VAT', { textOnly: true } ),
			address: automatticVatAddress,
			vatId: 'UK 376 1703 88',
		};
	}

	if ( country === 'JP' ) {
		return {
			country,
			taxName: translate( 'CT', { textOnly: true } ),
			address: automatticVatAddress,
			vatId: '4700150101102',
		};
	}

	return undefined;
}

export function VatVendorDetails( { transaction }: { transaction: BillingTransaction } ) {
	const translate = useTranslate();
	const vendorInfo = getVatVendorInfo( transaction.tax_country_code, transaction.date, translate );
	if ( ! vendorInfo ) {
		return null;
	}

	return (
		<li>
			<strong>
				{ translate( 'Vendor %(taxName)s Details', {
					args: { taxName: vendorInfo.taxName },
					comment: 'taxName is a localized tax, like VAT or GST',
				} ) }
			</strong>
			<span>
				{ vendorInfo.address.map( ( addressLine ) => (
					<div key={ addressLine }>{ addressLine }</div>
				) ) }
			</span>
			<span className="receipt__vat-vendor-details-number">
				<strong>{ vendorInfo.taxName }</strong> { vendorInfo.vatId }
			</span>
		</li>
	);
}
