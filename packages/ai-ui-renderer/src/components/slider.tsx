import { createComponentImplementation } from '@a2ui/react';
import { RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { z } from 'zod';
import { useInputValue } from '../hooks/use-input-value';
import { NumberValueSchema, StringValueSchema } from '../utils/schemas';

export const Slider = createComponentImplementation(
	{
		name: 'Slider',
		schema: z.object( {
			label: StringValueSchema.optional(),
			min: z.number().optional(),
			max: z.number(),
			value: NumberValueSchema,
		} ),
	},
	( { props, context } ) => {
		const [ value, onChange ] = useInputValue(
			props.value ?? props.min ?? 0,
			props.setValue,
			context
		);

		return (
			<RangeControl
				label={ props.label ?? __( 'Value', 'default' ) }
				min={ props.min ?? 0 }
				max={ props.max }
				value={ value }
				onChange={ ( nextValue ) => nextValue !== undefined && onChange( nextValue ) }
			/>
		);
	}
);
