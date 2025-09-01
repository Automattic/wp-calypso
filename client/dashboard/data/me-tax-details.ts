import type { CountryListItemBase } from '@automattic/api-core';
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

export interface CountryListItemWithoutVat extends CountryListItemBase {
	vat_supported: false;
}
export interface CountryListItemWithVat extends CountryListItemBase {
	vat_supported: true;
	tax_country_codes: string[];
}
export type CountryListItem = CountryListItemWithVat | CountryListItemWithoutVat;
