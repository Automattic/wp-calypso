/**
 * WordPress dependencies
 */
import { useContext, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { FormField, SimpleFormField } from '../types';
import { getFormFieldLayout } from './index';
import DataFormContext from '../components/dataform-context';
import { isCombinedField } from './is-combined-field';
import { useFieldError, useFieldValidation } from '../components/validator';
import { NormalizedFormField } from '../normalize-form-fields';

interface DataFormFieldProps< Item > {
	data: Item;
	formField: NormalizedFormField;
	onChange: ( value: any ) => void;
	children?: (
		FieldLayout: ( props: {
			data: Item;
			field: FormField;
			onChange: ( value: any ) => void;
			hideLabelFromVision?: boolean;
			errorMessage: string | undefined;
		} ) => React.JSX.Element | null,
		field: FormField
	) => React.JSX.Element;
}

export function DataFormField< Item >( {
	data,
	formField,
	onChange,
	children,
}: DataFormFieldProps< Item > ) {
	const { fields: fieldDefinitions, validation } =
		useContext( DataFormContext );

	function getFieldDefinition( field: SimpleFormField | string ) {
		const fieldId = typeof field === 'string' ? field : field.id;

		return fieldDefinitions.find(
			( fieldDefinition ) => fieldDefinition.id === fieldId
		);
	}

	const FieldLayout = getFormFieldLayout( formField.layout )?.component;

	const fieldDefinition = ! isCombinedField( formField )
		? getFieldDefinition( formField )
		: undefined;

	const handleChange = useFieldValidation(
		formField,
		data,
		fieldDefinition,
		validation,
		onChange
	);

	const errorMessage = useFieldError(
		formField,
		fieldDefinition,
		validation
	);

	useEffect( () => {}, [ errorMessage ] );

	if ( ! FieldLayout ) {
		return null;
	}

	if (
		fieldDefinition &&
		fieldDefinition.isVisible &&
		! fieldDefinition.isVisible( data )
	) {
		return null;
	}

	if ( children ) {
		return children( FieldLayout, formField );
	}

	return (
		<FieldLayout
			key={ formField.id }
			data={ data }
			field={ formField }
			errorMessage={ errorMessage }
			onChange={ handleChange }
		/>
	);
}
