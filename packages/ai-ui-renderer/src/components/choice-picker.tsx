import { createComponentImplementation } from '@a2ui/react';
import { DataBindingSchema } from '@a2ui/web_core/v1_0';
import { useId } from '@wordpress/element';
import { CheckboxControl, Field, Fieldset, Radio, RadioGroup, Stack } from '@wordpress/ui';
import clsx from 'clsx';
import { z } from 'zod';
import { useFieldProps } from '../hooks/use-field-props';
import { useInputValue } from '../hooks/use-input-value';
import { ChecksSchema, StringValueSchema } from '../utils/schemas';

export const ChoicePicker = createComponentImplementation(
	{
		name: 'ChoicePicker',
		schema: z.object( {
			label: StringValueSchema.optional(),
			variant: z.enum( [ 'multipleSelection', 'mutuallyExclusive' ] ).optional(),
			options: z.array( z.object( { label: StringValueSchema, value: z.string() } ) ),
			value: z.union( [ z.array( z.string() ), DataBindingSchema ] ),
			checks: ChecksSchema,
		} ),
	},
	( { props, context } ) => {
		const [ value, setValue ] = useInputValue( props.value ?? [], props.setValue, context );
		const { fieldProps, touch } = useFieldProps( props.validationErrors );
		const descriptionId = useId();
		const describedBy = fieldProps.description ? descriptionId : undefined;
		const isMultiple = props.variant === 'multipleSelection';

		const onChange = ( selected: string[] ) => {
			setValue( selected );
			touch();
		};

		const options = props.options.map( ( option ) => ( {
			...option,
			label: typeof option.label === 'string' ? option.label : option.value,
		} ) );

		return (
			<Fieldset.Root
				className={ clsx( 'ai-ui-renderer__choice-picker', fieldProps.className ) }
				disabled={ fieldProps.disabled }
				render={
					isMultiple ? undefined : (
						<RadioGroup
							value={ value[ 0 ] ?? '' }
							disabled={ fieldProps.disabled }
							onValueChange={ ( selected ) => {
								if ( typeof selected === 'string' ) {
									onChange( [ selected ] );
								}
							} }
						/>
					)
				}
			>
				{ props.label && <Fieldset.Legend>{ props.label }</Fieldset.Legend> }
				<Stack direction="column" gap="md">
					{ options.map( ( option ) =>
						isMultiple ? (
							<CheckboxControl
								key={ option.value }
								label={ option.label }
								checked={ value.includes( option.value ) }
								disabled={ fieldProps.disabled }
								aria-invalid={ fieldProps[ 'aria-invalid' ] }
								aria-describedby={ describedBy }
								onCheckedChange={ ( checked ) =>
									onChange(
										checked
											? [ ...value, option.value ]
											: value.filter( ( selected ) => selected !== option.value )
									)
								}
							/>
						) : (
							<Field.Root key={ option.value }>
								<Field.Item render={ <Stack direction="row" gap="sm" align="center" /> }>
									<Radio
										value={ option.value }
										disabled={ fieldProps.disabled }
										aria-invalid={ fieldProps[ 'aria-invalid' ] }
										aria-describedby={ describedBy }
									/>
									<Field.Label variant="plain">{ option.label }</Field.Label>
								</Field.Item>
							</Field.Root>
						)
					) }
				</Stack>
				{ fieldProps.description && (
					<Fieldset.Description id={ descriptionId }>
						{ fieldProps.description }
					</Fieldset.Description>
				) }
			</Fieldset.Root>
		);
	}
);
