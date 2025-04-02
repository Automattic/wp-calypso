import { ComboboxControl } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import { forwardRef, useEffect, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { ComboboxControlProps, ValidatedControlProps } from './types';

type Value = ComboboxControlProps[ 'value' ];

export const ValidatedComboboxControl = forwardRef<
	HTMLInputElement,
	ComboboxControlProps & ValidatedControlProps< Value >
>( ( { required, onReportCustomValidity, onChange, ...restProps }, forwardedRef ) => {
	const validityTargetRef = useRef< HTMLInputElement >( null );
	const mergedRefs = useMergeRefs( [ forwardedRef, validityTargetRef ] );
	const valueRef = useRef< Value >( restProps.value );

	// TODO: Upstream limitation - The `required` attribute is not passed down to the input,
	// so we need to set it manually.
	useEffect( () => {
		const input =
			validityTargetRef.current?.querySelector< HTMLInputElement >( 'input[role="combobox"]' );
		if ( input ) {
			input.required = required ?? false;
		}
	}, [ required ] );

	return (
		// TODO: Bug - Missing value error is not cleared immediately on change, waits for blur.
		<ControlWithError
			required={ required }
			ref={ mergedRefs }
			render={
				<ComboboxControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					{ ...restProps }
					onChange={ ( value ) => {
						valueRef.current = value;
						onChange?.( value );
					} }
				/>
			}
			onReportCustomValidity={ () => {
				return onReportCustomValidity?.( valueRef.current );
			} }
			getValidityTarget={ () =>
				validityTargetRef.current?.querySelector< HTMLInputElement >( 'input[role="combobox"]' )
			}
		/>
	);
} );
