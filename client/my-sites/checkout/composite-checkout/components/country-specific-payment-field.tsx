import { createElement } from 'react';
import type { ComponentType } from 'react';

export type OnFieldChange = ( event: { target: { name: string; value: string } } ) => void;

export interface InteriorFieldProps {
	value?: string;
	additionalClasses?: string[];
	isError?: boolean;
	errorMessage?: string;
	name?: string;
	autoComplete?: string;
	labelClass?: string;
	disabled?: boolean;
	onBlur?: OnFieldChange;
	onChange?: OnFieldChange;
}

export interface CountrySpecificPaymentFieldProps< P extends InteriorFieldProps > {
	/*
	 * The name of the field which will be used by the other props.
	 */
	fieldName: string;

	/**
	 * The React component to render.
	 *
	 * This is designed to work with specific components that implement
	 * `InteriorFieldProps`.
	 *
	 * For example, `Input`, but it can be anything. When the component is
	 * rendered, it will be provided with the props specified in the `additionalProps` prop
	 * combined with some additional props, listed below. Note that if any of the
	 * following props are also provided in `additionalProps`, those props will override
	 * the automatic ones.
	 *
	 * - `value` will be provided with getFieldValue(`fieldName`).
	 * - `errorMessage` will be provided with getErrorMessages(`fieldName`)[0].
	 * - `disabled` will be provided with `disabled`.
	 * - `handleFieldChange` will be provided with `handleFieldChange`.
	 * - `additionalClasses` will be 'checkout__checkout-field'.
	 * - `isError` will be true if `errorMessage` is set.
	 * - `name` will be `fieldName`.
	 * - `onBlur` will call `handleFieldChange` with the appropriate values.
	 * - `onChange` will call `handleFieldChange` with the appropriate values.
	 * - `autoComplete` will be 'off'.
	 * - `labelClass` will be 'checkout__form-label'.
	 */
	componentClass: ComponentType< P >;

	/**
	 * The props for the the `componentClass` element.
	 *
	 * These will override any of the props automatically provided by this
	 * component. See `componentClass` for details on the automatic props.
	 */
	additionalProps?: P;

	/**
	 * A convenience prop for `additionalProps.disabled`.
	 */
	disabled?: boolean;

	/**
	 * A function that will be called to provide the `errorMessage` of the component.
	 *
	 * This can provide multiple error messages but only the first will be passed
	 * along to the component inside.
	 */
	getErrorMessages: ( fieldName: string ) => string[];

	/**
	 * A function that will be called to provide the `value` of the component.
	 */
	getFieldValue: ( fieldName: string ) => string;

	/**
	 * A function that will be when the field is changed.
	 */
	handleFieldChange: ( fieldName: string, newValue: string ) => void;
}

interface CreateFieldArgs< P extends InteriorFieldProps > {
	fieldName: CountrySpecificPaymentFieldProps< P >[ 'fieldName' ];
	componentClass: CountrySpecificPaymentFieldProps< P >[ 'componentClass' ];
	additionalProps: CountrySpecificPaymentFieldProps< P >[ 'additionalProps' ];
	handleFieldChange: CountrySpecificPaymentFieldProps< P >[ 'handleFieldChange' ];
	disabled: CountrySpecificPaymentFieldProps< P >[ 'disabled' ];
	value: string;
	errorMessage: string;
}

/**
 * Render a dynamic form element for a payment method.
 *
 * This component is a convenience component for rendering certain form fields.
 * It's designed to support the dynamic form fields rendered by
 * `CountrySpecificPaymentFields` so its API is a little awkward. Read the docs
 * for its props to learn more.
 */
export function CountrySpecificPaymentField< P extends InteriorFieldProps >( {
	fieldName,
	componentClass,
	additionalProps,
	disabled,
	getErrorMessages,
	getFieldValue,
	handleFieldChange,
}: CountrySpecificPaymentFieldProps< P > ) {
	const errorMessages = getErrorMessages( fieldName );
	return createField( {
		fieldName,
		componentClass,
		additionalProps,
		value: getFieldValue( fieldName ),
		errorMessage: errorMessages.length > 0 ? errorMessages[ 0 ] : '',
		handleFieldChange,
		disabled: disabled ?? false,
	} );
}

function createField< P extends InteriorFieldProps >( {
	fieldName,
	componentClass,
	additionalProps,
	value,
	errorMessage,
	handleFieldChange,
	disabled,
}: CreateFieldArgs< P > ) {
	const onFieldChange: OnFieldChange = ( event ) =>
		handleFieldChange( event.target.name, event.target.value );
	const fieldProps = Object.assign(
		{},
		{
			additionalClasses: 'checkout__checkout-field',
			isError: errorMessage.length > 0,
			errorMessage,
			name: fieldName,
			onBlur: onFieldChange,
			onChange: onFieldChange,
			value,
			autoComplete: 'off',
			labelClass: 'checkout__form-label',
			disabled,
		},
		additionalProps
	);

	return createElement( componentClass, fieldProps );
}
