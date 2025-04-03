import { TextControl } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import { forwardRef, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { TextControlProps, ValidatedControlProps } from './types';

type Value = TextControlProps[ 'value' ];

export const ValidatedTextControl = forwardRef<
	HTMLInputElement,
	Omit< TextControlProps, '__next40pxDefaultSize' | '__nextHasNoMarginBottom' > &
		ValidatedControlProps< Value >
>( ( { required, onReportCustomValidity, onChange, ...restProps }, forwardedRef ) => {
	const validityTargetRef = useRef< HTMLInputElement >( null );
	const mergedRefs = useMergeRefs( [ forwardedRef, validityTargetRef ] );
	const valueRef = useRef< Value >( restProps.value );

	return (
		<ControlWithError
			required={ required }
			render={
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					ref={ mergedRefs }
					onChange={ ( value ) => {
						valueRef.current = value;
						onChange?.( value );
					} }
					{ ...restProps }
				/>
			}
			onReportCustomValidity={ () => {
				return onReportCustomValidity?.( valueRef.current );
			} }
			getValidityTarget={ () => validityTargetRef.current }
		/>
	);
} );
