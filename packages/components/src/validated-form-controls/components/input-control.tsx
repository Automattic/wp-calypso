// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
import { __experimentalInputControl as InputControl } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import React, { forwardRef, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { InputControlProps, ValidatedControlProps } from './types';

type Value = InputControlProps[ 'value' ];

export const ValidatedInputControl = forwardRef<
	HTMLInputElement,
	Omit< InputControlProps, '__next40pxDefaultSize' > & ValidatedControlProps< Value >
>( ( { required, customValidator, onChange, markWhenOptional, ...restProps }, forwardedRef ) => {
	const validityTargetRef = useRef< HTMLInputElement >( null );
	const mergedRefs = useMergeRefs( [ forwardedRef, validityTargetRef ] );
	const valueRef = useRef< Value >( restProps.value );

	return (
		<ControlWithError
			required={ required }
			markWhenOptional={ markWhenOptional }
			render={
				<InputControl
					__next40pxDefaultSize
					ref={ mergedRefs }
					onChange={ ( value, ...args ) => {
						valueRef.current = value;
						onChange?.( value, ...args );
					} }
					{ ...restProps }
				/>
			}
			customValidator={ () => {
				return customValidator?.( valueRef.current );
			} }
			getValidityTarget={ () => validityTargetRef.current }
		/>
	);
} );
