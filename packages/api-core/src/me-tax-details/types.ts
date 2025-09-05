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
