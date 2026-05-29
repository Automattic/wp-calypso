import type { DataFormControlProps } from '@wordpress/dataviews';

export interface VatFormData {
	country: string;
	id: string;
	name: string;
	address: string;
}

/**
 * Per-field configuration that the custom DataForm controls need but that is
 * not part of the DataViews `Field` API. It is provided through React context
 * because `@wordpress/dataviews` strips unknown properties when normalizing
 * fields.
 */
export interface VatFieldConfig {
	isDisabled?: boolean;
	isVatAlreadySet?: boolean;
	canUserEdit?: boolean;
	taxName?: string;
}

export type VatFormControlProps = DataFormControlProps< VatFormData >;
