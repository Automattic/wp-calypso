/**
 * Implementation of the lodash "pick" function
 *
 * @param object Object to pick properties from
 * @param props The properties to pick
 * @returns An object with only the "picked" properties
 */
export default function pick< T, U extends keyof T >( object: T, props: Array< U > ): Pick< T, U > {
	if ( ! object || ! props ) {
		return {} as any; // same behavior as lodash.
	}
	return Object.assign(
		{},
		...props.filter( ( key ) => key in object ).map( ( key ) => ( { [ key ]: object[ key ] } ) )
	);
}
