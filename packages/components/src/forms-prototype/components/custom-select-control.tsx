import { CustomSelectControl } from '@wordpress/components';
import React, { forwardRef, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { ValidatedControlProps } from './types';

type Value = React.ComponentProps< typeof CustomSelectControl >[ 'value' ];

export const ValidatedCustomSelectControl = forwardRef<
	HTMLDivElement,
	React.ComponentProps< typeof CustomSelectControl > & ValidatedControlProps< Value >
>( ( { required, onReportCustomValidity, onChange, ...restProps }, forwardedRef ) => {
	const validityTargetRef = useRef< HTMLSelectElement >( null );
	const valueRef = useRef< Value >();

	return (
		<div className="a8c-use-validation__wrapper-with-error-delegate" ref={ forwardedRef }>
			<ControlWithError
				required={ required }
				render={
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
				}
				onReportCustomValidity={ () => {
					return onReportCustomValidity?.( valueRef.current );
				} }
				getValidityTarget={ () => validityTargetRef.current }
			/>
			{ /* TODO: Move delegate to separate file? */ }
			<select
				style={ {
					// TODO: Move to stylesheet
					position: 'absolute',
					top: 0,
					height: '100%',
					width: '100%',
					opacity: 0,
					pointerEvents: 'none',
				} }
				ref={ validityTargetRef }
				required={ required }
				tabIndex={ -1 }
				value={ restProps.value ? 'hasvalue' : '' }
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
} );
