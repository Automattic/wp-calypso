import { CheckboxControl } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import { forwardRef, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { CheckboxControlProps, ValidatedControlProps } from './types';

type Value = CheckboxControlProps[ 'checked' ];

const UnforwardedValidatedCheckboxControl = (
	{
		required,
		customValidator,
		onChange,
		markWhenOptional,
		...restProps
	}: Omit< CheckboxControlProps, '__nextHasNoMarginBottom' > & ValidatedControlProps< Value >,
	forwardedRef: React.ForwardedRef< HTMLInputElement >
) => {
	const validityTargetRef = useRef< HTMLDivElement >( null );
	const mergedRefs = useMergeRefs( [ forwardedRef, validityTargetRef ] );
	const valueRef = useRef< Value >( restProps.checked );

	return (
		<ControlWithError
			required={ required }
			markWhenOptional={ markWhenOptional }
			ref={ mergedRefs }
			customValidator={ () => {
				return customValidator?.( valueRef.current );
			} }
			getValidityTarget={ () =>
				validityTargetRef.current?.querySelector< HTMLInputElement >( 'input[type="checkbox"]' )
			}
		>
			<CheckboxControl
				__nextHasNoMarginBottom
				onChange={ ( value ) => {
					valueRef.current = value;
					onChange?.( value );
				} }
				// TODO: Upstream limitation - CheckboxControl doesn't support uncontrolled mode, visually.
				{ ...restProps }
			/>
		</ControlWithError>
	);
};

export const ValidatedCheckboxControl = forwardRef( UnforwardedValidatedCheckboxControl );
