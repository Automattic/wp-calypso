import { CheckboxControl } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import React, { forwardRef, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { CheckboxControlProps, ValidatedControlProps } from './types';

type Value = React.ComponentProps< typeof CheckboxControl >[ 'checked' ];

export const ValidatedCheckboxControl = forwardRef<
	HTMLInputElement,
	CheckboxControlProps & ValidatedControlProps< Value >
>( ( { required, onReportCustomValidity, onChange, ...restProps }, forwardedRef ) => {
	const validityTargetRef = useRef< HTMLDivElement >( null );
	const mergedRefs = useMergeRefs( [ forwardedRef, validityTargetRef ] );

	const valueRef = useRef< Value >( restProps.checked );

	return (
		<ControlWithError
			required={ required }
			ref={ mergedRefs }
			render={
				<CheckboxControl
					__nextHasNoMarginBottom
					onChange={ ( value ) => {
						valueRef.current = value;
						onChange?.( value );
					} }
					// TODO: Upstream limitation - CheckboxControl doesn't support uncontrolled mode, visually.
					{ ...restProps }
				/>
			}
			onReportCustomValidity={ () => {
				return onReportCustomValidity?.( valueRef.current );
			} }
			getValidityTarget={ () =>
				validityTargetRef.current?.querySelector< HTMLInputElement >( 'input[type="checkbox"]' )
			}
		/>
	);
} );
