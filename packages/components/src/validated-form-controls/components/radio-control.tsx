import { RadioControl } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import { forwardRef, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { RadioControlProps, ValidatedControlProps } from './types';

type Value = RadioControlProps[ 'selected' ];

const UnforwardedValidatedRadioControl = (
	{
		required,
		customValidator,
		onChange,
		markWhenOptional,
		...restProps
	}: RadioControlProps & ValidatedControlProps< Value >,
	forwardedRef: React.ForwardedRef< HTMLDivElement >
) => {
	const validityTargetRef = useRef< HTMLDivElement >( null );
	const mergedRefs = useMergeRefs( [ forwardedRef, validityTargetRef ] );
	const valueRef = useRef< Value >( restProps.selected );

	return (
		<ControlWithError
			required={ required }
			markWhenOptional={ markWhenOptional }
			// TODO: Upstream limitation - RadioControl does not accept a ref.
			ref={ mergedRefs }
			customValidator={ () => {
				return customValidator?.( valueRef.current );
			} }
			getValidityTarget={ () =>
				validityTargetRef.current?.querySelector< HTMLInputElement >( 'input[type="radio"]' )
			}
		>
			<RadioControl
				onChange={ ( value ) => {
					valueRef.current = value;
					onChange?.( value );
				} }
				{ ...restProps }
			/>
		</ControlWithError>
	);
};

export const ValidatedRadioControl = forwardRef( UnforwardedValidatedRadioControl );
