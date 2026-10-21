import { createComponentImplementation } from '@a2ui/react/v0_9';
import { DataBindingSchema, SliderApi } from '@a2ui/web_core/v0_9';
import { RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { z } from 'zod';
import useInputValue from './use-input-value';

export const Slider = createComponentImplementation(
	{
		name: SliderApi.name,
		schema: SliderApi.schema.pick( { label: true, min: true, max: true, value: true } ).extend( {
			label: z.union( [ z.string(), DataBindingSchema ] ).optional(),
			value: z.union( [ z.number(), DataBindingSchema ] ),
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
