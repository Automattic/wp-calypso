import { ToggleControl } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import { forwardRef, useRef, useEffect } from 'react';
import { ControlWithError } from '../control-with-error';
import type { ToggleControlProps, ValidatedControlProps } from './types';

type Value = ToggleControlProps[ 'checked' ];

// TODO: Should we customize the default `missingValue` message? It says to "check this box".

export const ValidatedToggleControl = forwardRef<
	HTMLInputElement,
	ToggleControlProps & ValidatedControlProps< Value >
>( ( { required, onReportCustomValidity, onChange, ...restProps }, forwardedRef ) => {
	const validityTargetRef = useRef< HTMLInputElement >( null );
	const mergedRefs = useMergeRefs( [ forwardedRef, validityTargetRef ] );
	const valueRef = useRef< Value >( restProps.checked );

	// TODO: Upstream limitation - The `required` attribute is not passed down to the input,
	// so we need to set it manually.
	useEffect( () => {
		if ( validityTargetRef.current ) {
			validityTargetRef.current.required = required ?? false;
		}
	}, [ required ] );

	return (
		<ControlWithError
			required={ required }
			render={
				<ToggleControl
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
