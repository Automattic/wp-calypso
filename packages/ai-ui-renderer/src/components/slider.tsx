import { createComponentImplementation } from '@a2ui/react';
import { useId, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Fieldset, Input, Stack } from '@wordpress/ui';
import clsx from 'clsx';
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
			steps: z.number().int().positive().optional(),
			value: NumberValueSchema,
			checks: ChecksSchema,
		} ),
	},
	( { props, context } ) => {
		const id = useId();
		const [ numberDraft, setNumberDraft ] = useState< string | null >( null );
		const [ value, setValue ] = useInputValue(
			props.value ?? props.min ?? 0,
			props.setValue,
			context
		);
		const { fieldProps, touch } = useFieldProps( props.validationErrors );
		const { className, description, ...controlProps } = fieldProps;
		const min = props.min ?? 0;
		const step = props.steps && props.max > min ? ( props.max - min ) / props.steps : 'any';
		const inputProps = {
			...controlProps,
			min,
			max: props.max,
			step,
			'aria-labelledby': `${ id }-label`,
			'aria-describedby': description ? `${ id }-description` : undefined,
		};

		return (
			<Fieldset.Root className={ clsx( 'ai-ui-renderer__slider', className ) }>
				<Fieldset.Legend id={ `${ id }-label` }>
					{ props.label ?? __( 'Value', 'default' ) }
				</Fieldset.Legend>
				<Stack direction="row" gap="md" align="center">
					<input
						{ ...inputProps }
						className="ai-ui-renderer__slider-control"
						type="range"
						value={ value }
						onChange={ ( event ) => {
							setNumberDraft( null );
							setValue( event.currentTarget.valueAsNumber );
							touch();
						} }
					/>
					<Input
						{ ...inputProps }
						className="ai-ui-renderer__slider-value"
						type="number"
						value={ numberDraft ?? value }
						onChange={ ( event ) => {
							const input = event.currentTarget;
							setNumberDraft( input.value );
							if ( input.validity.valid && Number.isFinite( input.valueAsNumber ) ) {
								setValue( input.valueAsNumber );
							}
							touch();
						} }
						onBlur={ () => {
							setNumberDraft( null );
							touch();
						} }
					/>
				</Stack>
				{ description && (
					<Fieldset.Description id={ `${ id }-description` }>{ description }</Fieldset.Description>
				) }
			</Fieldset.Root>
		);
	}
);
