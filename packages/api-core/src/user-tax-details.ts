import wpcom from 'calypso/lib/wp';
import type { Field, NormalizedField } from '@wordpress/dataviews';

export interface UserTaxFormData {
	country: string;
	id: string;
	address: string;
	name: string;
}

export interface UserTaxDetails {
	country?: string | null;
	id?: string | null;
	address?: string | null;
	name?: string | null;
	isForBusiness?: boolean | null;
	can_user_edit?: boolean | false;
}

export type UserTaxField = Field< UserTaxFormData > & {
	isDisabled?: boolean;
	isVatAlreadySet?: boolean;
	canUserEdit?: boolean;
	taxName?: string;
};

export type UserTaxNormalizedField = NormalizedField< UserTaxFormData > & {
	isDisabled?: boolean;
	isVatAlreadySet?: boolean;
	canUserEdit?: boolean;
	taxName?: string;
};

export interface UserTaxFormControlProps {
	data: UserTaxFormData;
	field: UserTaxNormalizedField;
	onChange: ( edits: Partial< UserTaxFormData > ) => void;
}

export async function fetchUserTaxDetails(): Promise< UserTaxFormData > {
	return await wpcom.req.get( '/me/vat-info' );
}

export async function updateUserTaxDetails(
	data: Partial< UserTaxFormData >
): Promise< Partial< UserTaxFormData > > {
	const savableKeys = [ 'country', 'id', 'name', 'address' ];
	for ( const key in data ) {
		if ( ! savableKeys.includes( key ) ) {
			delete data[ key as keyof UserTaxFormData ];
		}
	}
	return await wpcom.req.post( '/me/vat-info', data );
}

export interface CountryListItemBase {
	code: string;
	name: string;
	has_postal_codes?: boolean;
	tax_needs_city?: boolean;
	tax_needs_subdivision?: boolean;
	tax_needs_organization?: boolean;
	tax_needs_address?: boolean;

	/**
	 * The localized name of the tax (eg: "VAT", "GST", etc.).
	 */
	tax_name?: string;
}
export interface CountryListItemWithoutVat extends CountryListItemBase {
	vat_supported: false;
}
export interface CountryListItemWithVat extends CountryListItemBase {
	vat_supported: true;
	tax_country_codes: string[];
}
export type CountryListItem = CountryListItemWithVat | CountryListItemWithoutVat;
