import { TextareaControl } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import { forwardRef, useRef } from 'react';
import { ControlWithError } from '../control-with-error';
import type { TextareaControlProps, ValidatedControlProps } from './types';

type Value = TextareaControlProps[ 'value' ];

export const ValidatedTextareaControl = forwardRef<
	HTMLTextAreaElement,
	Omit< TextareaControlProps, '__nextHasNoMarginBottom' > & ValidatedControlProps< Value >
>(
	(
		{ required, onReportCustomValidity, onChange, markWhenOptional, ...restProps },
		forwardedRef
	) => {
		const validityTargetRef = useRef< HTMLTextAreaElement >( null );
		const mergedRefs = useMergeRefs( [ forwardedRef, validityTargetRef ] );
		const valueRef = useRef< Value >( restProps.value );

		return (
			<ControlWithError
				required={ required }
				markWhenOptional={ markWhenOptional }
				render={
					<TextareaControl
						__nextHasNoMarginBottom
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
	}
);
