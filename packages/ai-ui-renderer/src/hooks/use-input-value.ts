import { DataBindingSchema } from '@a2ui/web_core/v1_0';
import { useEffect, useRef, useState } from '@wordpress/element';
import type { ComponentContext } from '@a2ui/web_core';

/** Keeps literal inputs editable while bound inputs read and write the surface data model. */
export function useInputValue< T extends string | number | boolean | string[] >(
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
				JSON.stringify( nextValue ) !== JSON.stringify( previousValue.current ) &&
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
	const isBound = DataBindingSchema.safeParse( rawValue ).success;

	return [
		isBound ? value : localValue,
		( nextValue: T ) => {
			setLocalValue( nextValue );
			setValue( nextValue );
		},
	] as const;
}
