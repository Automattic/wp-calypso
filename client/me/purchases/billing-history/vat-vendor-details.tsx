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

function isCountryInEu( country: string ): boolean {
	const countries = [
		'AT',
		'BE',
		'BG',
		'CH',
		'CY',
		'CZ',
		'DE',
		'DK',
		'EE',
		'EL',
		'ES',
		'FI',
		'FR',
		'HR',
		'HU',
		'IE',
		'IT',
		'LT',
		'LU',
		'LV',
		'MT',
		'NL',
		'PL',
		'PT',
		'RO',
		'SE',
		'SI',
		'SK',
		'XI',
	];
	return countries.includes( country );
}

function getVatVendorInfo(
	country: string,
	translate: ReturnType< typeof useTranslate >
): VatVendorInfo | undefined {
	if ( isCountryInEu( country ) ) {
		return {
			country,
			taxName: translate( 'VAT', { textOnly: true } ),
			address: [
				'Aut O’Mattic Ltd.',
				'c/o Noone Casey',
				'Grand Canal Dock, 25 Herbert Pl',
				'Dublin, D02 AY86',
				'Ireland',
			],
			vatId: 'IE3255131SH',
		};
	}

	if ( country === 'GB' ) {
		return {
			country,
			taxName: translate( 'VAT', { textOnly: true } ),
			address: [
				'Aut O’Mattic Ltd.',
				'c/o Noone Casey',
				'Grand Canal Dock, 25 Herbert Pl',
				'Dublin, D02 AY86',
				'Ireland',
			],
			vatId: 'UK 376 1703 88',
		};
	}

	if ( country === 'CA' ) {
		return {
			country,
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
