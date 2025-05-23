import { TextareaControl } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import { forwardRef, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { TextareaControlProps, ValidatedControlProps } from './types';

type Value = TextareaControlProps[ 'value' ];

const UnforwardedValidatedTextareaControl = (
	{
		required,
		customValidator,
		onChange,
		markWhenOptional,
		...restProps
	}: Omit< TextareaControlProps, '__nextHasNoMarginBottom' > & ValidatedControlProps< Value >,
	forwardedRef: React.ForwardedRef< HTMLTextAreaElement >
) => {
	const validityTargetRef = useRef< HTMLTextAreaElement >( null );
	const mergedRefs = useMergeRefs( [ forwardedRef, validityTargetRef ] );
	const valueRef = useRef< Value >( restProps.value );

	return (
		<ControlWithError
			required={ required }
			markWhenOptional={ markWhenOptional }
			customValidator={ () => {
				return customValidator?.( valueRef.current );
			} }
			getValidityTarget={ () => validityTargetRef.current }
		>
			<TextareaControl
				__nextHasNoMarginBottom
				ref={ mergedRefs }
				onChange={ ( value ) => {
					valueRef.current = value;
					onChange?.( value );
				} }
				{ ...restProps }
			/>
		</ControlWithError>
	);
};

export const ValidatedTextareaControl = forwardRef( UnforwardedValidatedTextareaControl );
