import { createComponentImplementation } from '@a2ui/react';
import { CheckboxControl } from '@wordpress/components';
import { z } from 'zod';
import { useInputValue } from '../hooks/use-input-value';
import { BooleanValueSchema, StringValueSchema } from '../utils/schemas';

export const CheckBox = createComponentImplementation(
	{
		name: 'CheckBox',
		schema: z.object( {
			label: StringValueSchema,
			value: BooleanValueSchema,
		} ),
	},
	( { props, context } ) => {
		const [ value, onChange ] = useInputValue( props.value ?? false, props.setValue, context );

		return <CheckboxControl label={ props.label } checked={ value } onChange={ onChange } />;
	}
);
