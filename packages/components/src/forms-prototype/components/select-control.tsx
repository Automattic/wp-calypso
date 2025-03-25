import { SelectControl } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import React, { forwardRef, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { ValidatedControlProps } from './types';

// Only support single value selection
type SelectControlProps = Omit<
	React.ComponentProps< typeof SelectControl >,
	'multiple' | 'onChange' | 'value'
> & {
	onChange?: ( value: string ) => void;
	value?: string;
};

type Value = SelectControlProps[ 'value' ];

export const ValidatedSelectControl = forwardRef<
	HTMLSelectElement,
	SelectControlProps & ValidatedControlProps< Value >
>( ( { required, onReportCustomValidity, onChange, ...restProps }, forwardedRef ) => {
	const validityTargetRef = useRef< HTMLSelectElement >( null );
	const mergedRefs = useMergeRefs( [ forwardedRef, validityTargetRef ] );

	const valueRef = useRef< Value >( undefined );

	return (
		<ControlWithError
			required={ required }
			render={
				<SelectControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
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
