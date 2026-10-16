import { useEffect, useRef, useState } from '@wordpress/element';
import type { ComponentContext } from '@a2ui/web_core/v0_9';

/** Keeps literal inputs editable while bound inputs read and write the surface data model. */
export default function useInputValue< T extends string | number | boolean | string[] >(
	value: T,
	setValue: ( value: T ) => void,
	context: ComponentContext
) {
	const [ localValue, setLocalValue ] = useState( value );
	const previousValue = useRef( context.componentModel.properties.value );
	useEffect( () => {
		const subscription = context.componentModel.onUpdated.subscribe( () => {
			const nextValue = context.componentModel.properties.value;
			if (
				nextValue !== previousValue.current &&
				( typeof nextValue === 'string' ||
					typeof nextValue === 'number' ||
					typeof nextValue === 'boolean' ||
					Array.isArray( nextValue ) )
			) {
				setLocalValue( nextValue as T );
			}
			previousValue.current = nextValue;
		} );
		return () => subscription.unsubscribe();
	}, [ context.componentModel ] );
	const rawValue = context.componentModel.properties.value;
	const isBound = typeof rawValue === 'object' && rawValue !== null && 'path' in rawValue;
	return [
		isBound ? value : localValue,
		( nextValue: T ) => {
			setLocalValue( nextValue );
			setValue( nextValue );
		},
	] as const;
}
