/**
 * WordPress dependencies
 */
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useMemo } from '@wordpress/element';
/**
 * Internal dependencies
 */
import normalizeFormFields from '../normalize-form-fields';
import type { Form, FormField } from '../types';
import { DataFormField } from './data-form-field';

export function DataFormFieldOrchestrator< Item >( {
	data,
	form,
	onChange,
	children,
}: {
	data: Item;
	form: Form;
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
} ) {
	const normalizedFormFields = useMemo(
		() => normalizeFormFields( form ),
		[ form ]
	);

	return (
		<VStack spacing={ form?.type === 'panel' ? 2 : 4 }>
			{ normalizedFormFields.map( ( formField ) => {
				return (
					<DataFormField
						key={ formField.id }
						data={ data }
						formField={ formField }
						onChange={ onChange }
						children={ children }
					/>
				);
			} ) }
		</VStack>
	);
}
