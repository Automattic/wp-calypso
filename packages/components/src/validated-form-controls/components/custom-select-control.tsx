import { CustomSelectControl } from '@wordpress/components';
import { forwardRef, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { CustomSelectControlProps, ValidatedControlProps } from './types';

type Value = CustomSelectControlProps[ 'value' ];

const UnforwardedValidatedCustomSelectControl = (
	{
		required,
		customValidator,
		onChange,
		markWhenOptional,
		...restProps
	}: Omit< CustomSelectControlProps, '__next40pxDefaultSize' > & ValidatedControlProps< Value >,
	forwardedRef: React.ForwardedRef< HTMLDivElement >
) => {
	const validityTargetRef = useRef< HTMLSelectElement >( null );
	const valueRef = useRef< Value >( restProps.value );

	return (
		<div className="a8c-validated-control__wrapper-with-error-delegate" ref={ forwardedRef }>
			<ControlWithError
				required={ required }
				markWhenOptional={ markWhenOptional }
				customValidator={ () => {
					return customValidator?.( valueRef.current );
				} }
				getValidityTarget={ () => validityTargetRef.current }
			>
				<CustomSelectControl
					// TODO: Upstream limitation - Required isn't passed down correctly,
					// so it needs to be set on a delegate element.
					__next40pxDefaultSize
					onChange={ ( value ) => {
						valueRef.current = value.selectedItem;
						onChange?.( value );
					} }
					{ ...restProps }
				/>
			</ControlWithError>
			<select
				className="a8c-validated-control__error-delegate"
				ref={ validityTargetRef }
				required={ required }
				tabIndex={ -1 }
				value={ restProps.value?.key ? 'hasvalue' : '' }
				onChange={ () => {} }
				onFocus={ ( e ) => {
					e.target.previousElementSibling
						?.querySelector< HTMLButtonElement >( '[role="combobox"]' )
						?.focus();
				} }
			>
				<option value="">No selection</option>
				<option value="hasvalue">Has selection</option>
			</select>
		</div>
	);
};

export const ValidatedCustomSelectControl = forwardRef( UnforwardedValidatedCustomSelectControl );
