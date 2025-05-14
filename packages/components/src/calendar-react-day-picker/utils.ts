/**
 * WordPress dependencies
 */
import { useState, useCallback } from 'react';
import type { OnSelectHandler } from './types';

type Props< T > = {
	defaultValue?: T;
	value?: T | null | undefined;
	onChange?: OnSelectHandler< T > | OnSelectHandler< T | undefined >;
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

	let setValue;
	const uncontrolledSetValue: OnSelectHandler< T | undefined > = useCallback(
		( nextValue, triggerDate, modifiers, e ) => {
			setState( nextValue );
			// @ts-expect-error - onChange should be able to handle undefined,
			// but the conditional type is tricky to get around.
			onChange?.( nextValue, triggerDate, modifiers, e );
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

	return [ value as T | undefined, setValue as OnSelectHandler< T | undefined > ] as const;
}
