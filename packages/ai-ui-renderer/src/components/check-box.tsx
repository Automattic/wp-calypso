import { createComponentImplementation } from '@a2ui/react';
import { CheckboxControl } from '@wordpress/ui';
import { z } from 'zod';
import { useFieldProps } from '../hooks/use-field-props';
import { useInputValue } from '../hooks/use-input-value';
import { BooleanValueSchema, ChecksSchema, StringValueSchema } from '../utils/schemas';

export const CheckBox = createComponentImplementation(
	{
		name: 'CheckBox',
		schema: z.object( {
			label: StringValueSchema,
			value: BooleanValueSchema,
			checks: ChecksSchema,
		} ),
	},
	( { props, context } ) => {
		const [ value, setValue ] = useInputValue( props.value ?? false, props.setValue, context );
		const { fieldProps, touch } = useFieldProps( props.validationErrors );

		return (
			<CheckboxControl
				{ ...fieldProps }
				label={ props.label }
				checked={ value }
				onCheckedChange={ ( checked ) => {
					setValue( checked );
					touch();
				} }
			/>
		);
	}
);
