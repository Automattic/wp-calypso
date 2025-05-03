/**
 * WordPress dependencies
 */
import { useState } from 'react';
import type { OnSelectHandler } from './types';

type Props< T > = {
	defaultValue?: T;
	value?: T;
	onChange?: OnSelectHandler< T >;
};

/**
 * Simplified and improved implementation of useControlledState.
 * @param props
 * @param props.defaultValue
 * @param props.value
 * @param props.onChange
 * @returns The controlled value and the value setter.
 */
export function useControlledValue< T >( {
	defaultValue,
	onChange,
	value: valueProp,
}: Props< T > ) {
	const hasValue = typeof valueProp !== 'undefined';
	const initialValue = hasValue ? valueProp : defaultValue;
	const [ state, setState ] = useState( initialValue );
	const value = hasValue ? valueProp : state;

	let setValue: OnSelectHandler< T >;
	if ( hasValue && typeof onChange === 'function' ) {
		setValue = onChange;
	} else if ( ! hasValue && typeof onChange === 'function' ) {
		setValue = ( nextValue, triggerDate, modifiers, e ) => {
			onChange( nextValue, triggerDate, modifiers, e );
			setState( nextValue );
		};
	} else {
		setValue = setState;
	}

	return [ value, setValue as typeof setState ] as const;
}
