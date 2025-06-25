import { __experimentalNumberControl as NumberControl } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import { forwardRef, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { NumberControlProps, ValidatedControlProps } from './types';

type Value = NumberControlProps[ 'value' ];

const UnforwardedValidatedNumberControl = (
	{
		required,
		customValidator,
		onChange,
		markWhenOptional,
		...restProps
	}: Omit< NumberControlProps, '__next40pxDefaultSize' > & ValidatedControlProps< Value >,
	forwardedRef: React.ForwardedRef< HTMLInputElement >
) => {
	const validityTargetRef = useRef< HTMLInputElement >( null );
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
			<NumberControl
				__next40pxDefaultSize
				ref={ mergedRefs }
				// TODO: Upstream limitation - When form is submitted when value is undefined, it will
				// automatically set a clamped value (as defined by `min` attribute, so 0 by default).
				onChange={ ( value, ...args ) => {
					valueRef.current = value;
					onChange?.( value, ...args );
				} }
				{ ...restProps }
			/>
		</ControlWithError>
	);
};

export const ValidatedNumberControl = forwardRef( UnforwardedValidatedNumberControl );
