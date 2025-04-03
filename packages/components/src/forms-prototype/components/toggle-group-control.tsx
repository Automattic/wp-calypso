// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
import { __experimentalToggleGroupControl as ToggleGroupControl } from '@wordpress/components';
import React, { forwardRef, useId, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { ToggleGroupControlProps, ValidatedControlProps } from './types';

type Value = ToggleGroupControlProps[ 'value' ];

export const ValidatedToggleGroupControl = forwardRef<
	HTMLInputElement,
	Omit< ToggleGroupControlProps, '__next40pxDefaultSize' | '__nextHasNoMarginBottom' > &
		ValidatedControlProps< Value >
>( ( { required, onReportCustomValidity, onChange, ...restProps }, forwardedRef ) => {
	const validityTargetRef = useRef< HTMLInputElement >( null );
	const valueRef = useRef< Value >( restProps.value );

	const nameAttr = useId();

	return (
		<div className="a8c-validated-control__wrapper-with-error-delegate">
			<ControlWithError
				required={ required }
				render={
					<ToggleGroupControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						ref={ forwardedRef }
						// TODO: Upstream limitation - In uncontrolled mode, starting from an undefined value then
						// setting a value has a visual bug.
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
			<input
				className="a8c-validated-control__error-delegate"
				type="radio"
				ref={ validityTargetRef }
				required={ required }
				checked={ restProps.value != null }
				tabIndex={ -1 }
				// A name attribute is needed for the `required` behavior to work.
				name={ nameAttr }
				onChange={ () => {} }
				onFocus={ ( e ) => {
					e.target.previousElementSibling
						?.querySelector< HTMLButtonElement | HTMLInputElement >( '[data-active-item="true"]' )
						?.focus();
				} }
			/>
		</div>
	);
} );
