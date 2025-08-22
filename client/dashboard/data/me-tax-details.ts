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
	country?: string | undefined;
	id?: string | undefined;
	address?: string | undefined;
	name?: string | undefined;
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

export type SetUserTaxDetails = ( userTaxDetails: UserTaxDetails ) => Promise< UserTaxDetails >;

export async function fetchUserTaxDetails(): Promise< UserTaxFormData > {
	return await wpcom.req.get( '/me/vat-info' );
}

export async function setUserTaxDetails(
	userTaxDetails: UserTaxDetails
): Promise< UserTaxDetails > {
	return await wpcom.req.post( {
		path: '/me/vat-info',
		body: userTaxDetails,
	} );
}

export async function updateUserTaxDetails(
	data: Partial< UserTaxFormData >
): Promise< Partial< UserTaxFormData > > {
	const { country, id, name, address } = data;
	return await wpcom.req.post( '/me/vat-info', { country, id, name, address } );
}

export interface CountryListItemWithoutVat extends CountryListItemBase {
	vat_supported: false;
}
export interface CountryListItemWithVat extends CountryListItemBase {
	vat_supported: true;
	tax_country_codes: string[];
}
export type CountryListItem = CountryListItemWithVat | CountryListItemWithoutVat;
