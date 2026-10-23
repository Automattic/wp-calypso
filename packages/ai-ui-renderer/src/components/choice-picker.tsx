import { createComponentImplementation } from '@a2ui/react';
import { DataBindingSchema } from '@a2ui/web_core/v1_0';
import {
	BaseControl,
	CheckboxControl,
	RadioControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { z } from 'zod';
import { useInputValue } from '../hooks/use-input-value';
import { StringValueSchema } from '../utils/schemas';

export const ChoicePicker = createComponentImplementation(
	{
		name: 'ChoicePicker',
		schema: z.object( {
			label: StringValueSchema.optional(),
			variant: z.enum( [ 'multipleSelection', 'mutuallyExclusive' ] ).optional(),
			options: z.array( z.object( { label: StringValueSchema, value: z.string() } ) ),
			value: z.union( [ z.array( z.string() ), DataBindingSchema ] ),
		} ),
	},
	( { props, context } ) => {
		const [ value, onChange ] = useInputValue( props.value ?? [], props.setValue, context );
		const options = props.options.map( ( option ) => ( {
			...option,
			label: typeof option.label === 'string' ? option.label : option.value,
		} ) );

		if ( props.variant !== 'multipleSelection' ) {
			return (
				<RadioControl
					label={ props.label }
					options={ options }
					selected={ value[ 0 ] ?? '' }
					onChange={ ( selected ) => onChange( [ selected ] ) }
				/>
			);
		}

		return (
			<fieldset className="ai-ui-renderer__choice-picker">
				{ props.label && (
					<BaseControl.VisualLabel as="legend">{ props.label }</BaseControl.VisualLabel>
				) }
				<VStack spacing={ 3 }>
					{ options.map( ( option ) => (
						<CheckboxControl
							key={ option.value }
							label={ option.label }
							checked={ value.includes( option.value ) }
							onChange={ ( checked ) =>
								onChange(
									checked
										? [ ...value, option.value ]
										: value.filter( ( selected ) => selected !== option.value )
								)
							}
						/>
					) ) }
				</VStack>
			</fieldset>
		);
	}
);
