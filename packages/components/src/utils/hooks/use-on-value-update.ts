/**
 * WordPress dependencies
 */
import { useEvent } from '@wordpress/compose';
import { useRef, useLayoutEffect } from 'react';

/**
 * Context object for the `onUpdate` callback of `useOnValueUpdate`.
 */
export type ValueUpdateContext< T > = {
	previousValue: T;
};

/**
 * Calls the `onUpdate` callback when the `value` changes.
 */
export function useOnValueUpdate< T >(
	/**
	 * The value to watch for changes.
	 */
	value: T,
	/**
	 * Callback to fire when the value changes.
	 */
	onUpdate: ( context: ValueUpdateContext< T > ) => void
) {
	const previousValueRef = useRef( value );
	const updateCallbackEvent = useEvent( onUpdate );
	useLayoutEffect( () => {
		if ( previousValueRef.current !== value ) {
			updateCallbackEvent( {
				previousValue: previousValueRef.current,
			} );
			previousValueRef.current = value;
		}
	}, [ updateCallbackEvent, value ] );
}
