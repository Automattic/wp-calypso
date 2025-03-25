import { RangeControl } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import React, { forwardRef, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { ValidatedControlProps } from './types';

type Value = React.ComponentProps< typeof RangeControl >[ 'value' ];

export const ValidatedRangeControl = forwardRef<
	HTMLInputElement,
	React.ComponentProps< typeof RangeControl > & ValidatedControlProps< Value >
>( ( { required, onReportCustomValidity, onChange, ...restProps }, forwardedRef ) => {
	const validityTargetRef = useRef< HTMLInputElement >( null );
	const mergedRefs = useMergeRefs( [ forwardedRef, validityTargetRef ] );
	const valueRef = useRef< Value >();

	return (
		<ControlWithError
			required={ required }
			render={
				<RangeControl
					{ ...restProps }
					ref={ mergedRefs }
					onChange={ ( value ) => {
						valueRef.current = value;
						onChange?.( value );
					} }
				/>
			}
			onReportCustomValidity={ () => {
				return onReportCustomValidity?.( valueRef.current );
			} }
			getValidityTarget={ () => validityTargetRef.current }
		/>
	);
} );
