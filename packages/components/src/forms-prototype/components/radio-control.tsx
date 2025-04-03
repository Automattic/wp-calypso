import { RadioControl } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import { forwardRef, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { RadioControlProps, ValidatedControlProps } from './types';

type Value = RadioControlProps[ 'selected' ];

export const ValidatedRadioControl = forwardRef<
	HTMLDivElement,
	RadioControlProps & ValidatedControlProps< Value >
>(
	(
		{ required, onReportCustomValidity, onChange, markWhenOptional, ...restProps },
		forwardedRef
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
				render={
					<RadioControl
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
				getValidityTarget={ () =>
					validityTargetRef.current?.querySelector< HTMLInputElement >( 'input[type="radio"]' )
				}
			/>
		);
	}
);
