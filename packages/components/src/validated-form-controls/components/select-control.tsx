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

const UnforwardedValidatedSelectControl = (
	{
		required,
		customValidator,
		onChange,
		markWhenOptional,
		...restProps
	}: Omit< SelectControlProps, '__next40pxDefaultSize' | '__nextHasNoMarginBottom' > &
		ValidatedControlProps< Value >,
	forwardedRef: React.ForwardedRef< HTMLSelectElement >
) => {
	const validityTargetRef = useRef< HTMLSelectElement >( null );
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
		</ControlWithError>
	);
};

export const ValidatedSelectControl = forwardRef( UnforwardedValidatedSelectControl );
