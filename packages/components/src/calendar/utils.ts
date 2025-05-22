/**
 * WordPress dependencies
 */
import { useState, useCallback } from 'react';

type Props< T > = {
	defaultValue?: T;
	value?: T | null | undefined;
	onChange?: ( newValue: T ) => void;
};

/**
 * Handles controlled and uncontrolled state for the selected calendar value.
 * It is assumed that the `value` prop is controlled when it's not undefined:
 * - initial date selected, uncontrolled: use a non-undefined`defaultValue`
 * - initial date selected, controlled: use a non-undefined `value`
 * - no date selected, controlled: set `value` to `null`
 *
 * The `onChange` prop will return `undefined` when no date is selected,
 * regardless of controlled / uncontrolled. It is expected that the consumer
 * of the component will handle setting the value to `null` to indicate no date
 * selected in controlled mode.
 */
export function useControlledValue< T >( {
	defaultValue,
	onChange,
	value: valueProp,
}: Props< T > ) {
	const hasValue = typeof valueProp !== 'undefined';
	const initialValue = hasValue ? valueProp : defaultValue;
	const [ state, setState ] = useState( initialValue );
	const value = ( hasValue ? valueProp : state ) ?? undefined;

	let setValue: typeof onChange;
	const uncontrolledSetValue: NonNullable< typeof onChange > = useCallback(
		( nextValue ) => {
			setState( nextValue );
			onChange?.( nextValue );
		},
		[ setState, onChange ]
	);
	if ( hasValue && typeof onChange === 'function' ) {
		// Controlled mode.
		setValue = onChange;
	} else if ( ! hasValue && typeof onChange === 'function' ) {
		// Uncontrolled mode, plus forwarding to the onChange prop.
		setValue = uncontrolledSetValue;
	} else {
		// Uncontrolled mode, only update internal state.
		setValue = setState;
	}

	return [ value, setValue ] as const;
}
