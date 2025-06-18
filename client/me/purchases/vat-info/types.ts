import type { Field, NormalizedField } from '@automattic/dataviews';

export interface VatFormData {
	country: string;
	id: string;
	name: string;
	address: string;
}

export type VatField = Field< VatFormData > & {
	isDisabled?: boolean;
	isVatAlreadySet?: boolean;
	taxName?: string;
};

export type VatNormalizedField = NormalizedField< VatFormData > & {
	isDisabled?: boolean;
	isVatAlreadySet?: boolean;
	taxName?: string;
};

export interface VatFormControlProps {
	data: VatFormData;
	field: VatNormalizedField;
	onChange: ( edits: Partial< VatFormData > ) => void;
}
