import wpcom from 'calypso/lib/wp';
import type { CountryListItemBase } from './domain-supported-countries';
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

export interface CountryListItemWithoutVat extends CountryListItemBase {
	vat_supported: false;
}
export interface CountryListItemWithVat extends CountryListItemBase {
	vat_supported: true;
	tax_country_codes: string[];
}
export type CountryListItem = CountryListItemWithVat | CountryListItemWithoutVat;

// From use-support-doc-data
export type ContextLink = {
	link: string;
	post_id?: number;
	blog_id?: number;
};

export type ContextLinks = Record< string, ContextLink >;

export type SupportDocData = {
	link: string;
	postId?: number;
	blogId?: number;
};
