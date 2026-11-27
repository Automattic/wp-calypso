import { createComponentImplementation } from '@a2ui/react';
import { DataBindingSchema } from '@a2ui/web_core/v1_0';
import { useId } from '@wordpress/element';
import {
	Checkbox,
	CheckboxControl,
	Field,
	Fieldset,
	Radio,
	RadioGroup,
	Stack,
} from '@wordpress/ui';
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
			displayStyle: z.enum( [ 'checkbox', 'chips' ] ).optional(),
			checks: ChecksSchema,
		} ),
	},
	( { props, context } ) => {
		const [ value, setValue ] = useInputValue( props.value ?? [], props.setValue, context );
		const { fieldProps, touch } = useFieldProps( props.validationErrors );
		const descriptionId = useId();
		const describedBy = fieldProps.description ? descriptionId : undefined;
		const isMultiple = props.variant === 'multipleSelection';
		const isChips = props.displayStyle === 'chips';

		const onChange = ( selected: string[] ) => {
			setValue( selected );
			touch();
		};

		const toggle = ( optionValue: string, checked: boolean ) =>
			onChange(
				checked
					? [ ...value, optionValue ]
					: value.filter( ( selected ) => selected !== optionValue )
			);

		const options = props.options.map( ( option ) => ( {
			...option,
			label: typeof option.label === 'string' ? option.label : option.value,
		} ) );

		const controlProps = {
			className: isChips ? 'ai-ui-renderer__choice-chip-control' : undefined,
			disabled: fieldProps.disabled,
			'aria-invalid': fieldProps[ 'aria-invalid' ],
			'aria-describedby': describedBy,
		};

		return (
			<Fieldset.Root
				className={ clsx(
					'ai-ui-renderer__choice-picker',
					{ 'ai-ui-renderer__choice-picker--chips': isChips },
					fieldProps.className
				) }
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
				<Stack
					direction={ isChips ? 'row' : 'column' }
					gap={ isChips ? 'sm' : 'md' }
					wrap={ isChips ? 'wrap' : undefined }
				>
					{ options.map( ( option ) =>
						isMultiple && ! isChips ? (
							<CheckboxControl
								key={ option.value }
								label={ option.label }
								checked={ value.includes( option.value ) }
								disabled={ fieldProps.disabled }
								aria-invalid={ fieldProps[ 'aria-invalid' ] }
								aria-describedby={ describedBy }
								onCheckedChange={ ( checked ) => toggle( option.value, checked ) }
							/>
						) : (
							<Field.Root key={ option.value }>
								<Field.Item
									className={ isChips ? 'ai-ui-renderer__choice-chip' : undefined }
									render={ isChips ? undefined : <Stack direction="row" gap="sm" align="center" /> }
								>
									{ isMultiple ? (
										<Checkbox
											{ ...controlProps }
											checked={ value.includes( option.value ) }
											onCheckedChange={ ( checked ) => toggle( option.value, checked ) }
										/>
									) : (
										<Radio { ...controlProps } value={ option.value } />
									) }
									<Field.Label
										variant="plain"
										className={ isChips ? 'ai-ui-renderer__choice-chip-label' : undefined }
									>
										{ option.label }
									</Field.Label>
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
