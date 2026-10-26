import { createComponentImplementation } from '@a2ui/react';
import { RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { z } from 'zod';
import { useFieldProps } from '../hooks/use-field-props';
import { useInputValue } from '../hooks/use-input-value';
import { ChecksSchema, NumberValueSchema, StringValueSchema } from '../utils/schemas';

export const Slider = createComponentImplementation(
	{
		name: 'Slider',
		schema: z.object( {
			label: StringValueSchema.optional(),
			min: z.number().optional(),
			max: z.number(),
			value: NumberValueSchema,
			checks: ChecksSchema,
		} ),
	},
	( { props, context } ) => {
		const [ value, setValue ] = useInputValue(
			props.value ?? props.min ?? 0,
			props.setValue,
			context
		);
		const { fieldProps, touch } = useFieldProps( props.validationErrors );
		const { description, ...rangeProps } = fieldProps;

		return (
			<RangeControl
				{ ...rangeProps }
				help={ description }
				label={ props.label ?? __( 'Value', 'default' ) }
				min={ props.min ?? 0 }
				max={ props.max }
				value={ value }
				onChange={ ( nextValue ) => {
					if ( nextValue !== undefined ) {
						setValue( nextValue );
						touch();
					}
				} }
			/>
		);
	}
);
