import { SelectControl } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import { forwardRef, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { SelectControlProps as _SelectControlProps, ValidatedControlProps } from './types';

// Only support single value selection
type SelectControlProps = Omit< _SelectControlProps, 'multiple' | 'onChange' | 'value' > & {
	onChange?: ( value: string ) => void;
	value?: string;
};

type Value = SelectControlProps[ 'value' ];

export const ValidatedSelectControl = forwardRef<
	HTMLSelectElement,
	Omit< SelectControlProps, '__next40pxDefaultSize' | '__nextHasNoMarginBottom' > &
		ValidatedControlProps< Value > & {
			markWhenOptional?: boolean;
		}
>( ( { required, customValidator, onChange, markWhenOptional, ...restProps }, forwardedRef ) => {
	const validityTargetRef = useRef< HTMLSelectElement >( null );
	const mergedRefs = useMergeRefs( [ forwardedRef, validityTargetRef ] );
	const valueRef = useRef< Value >( restProps.value );

	return (
		<ControlWithError
			required={ required }
			markWhenOptional={ markWhenOptional }
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
			customValidator={ () => {
				return customValidator?.( valueRef.current );
			} }
			getValidityTarget={ () => validityTargetRef.current }
		/>
	);
} );
