// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
import { __experimentalInputControl as InputControl } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import React, { forwardRef, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { InputControlProps, ValidatedControlProps } from './types';

type Value = InputControlProps[ 'value' ];

const UnforwardedValidatedInputControl = (
	{
		required,
		customValidator,
		onChange,
		markWhenOptional,
		...restProps
	}: Omit< InputControlProps, '__next40pxDefaultSize' > & ValidatedControlProps< Value >,
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
			<InputControl
				__next40pxDefaultSize
				ref={ mergedRefs }
				onChange={ ( value, ...args ) => {
					valueRef.current = value;
					onChange?.( value, ...args );
				} }
				{ ...restProps }
			/>
		</ControlWithError>
	);
};

export const ValidatedInputControl = forwardRef( UnforwardedValidatedInputControl );
