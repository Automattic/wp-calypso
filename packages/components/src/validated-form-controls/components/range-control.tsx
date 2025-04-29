import { RangeControl } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import { forwardRef, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { RangeControlProps, ValidatedControlProps } from './types';

type Value = RangeControlProps[ 'value' ];

export const ValidatedRangeControl = forwardRef<
	HTMLInputElement,
	Omit< RangeControlProps, '__next40pxDefaultSize' | '__nextHasNoMarginBottom' > &
		ValidatedControlProps< Value >
>( ( { required, customValidator, onChange, markWhenOptional, ...restProps }, forwardedRef ) => {
	const validityTargetRef = useRef< HTMLInputElement >( null );
	const mergedRefs = useMergeRefs( [ forwardedRef, validityTargetRef ] );
	const valueRef = useRef< Value >( restProps.value );

	return (
		<ControlWithError
			required={ required }
			markWhenOptional={ markWhenOptional }
			render={
				<RangeControl
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
			customValidator={ () => {
				return customValidator?.( valueRef.current );
			} }
			getValidityTarget={ () => validityTargetRef.current }
		/>
	);
} );
