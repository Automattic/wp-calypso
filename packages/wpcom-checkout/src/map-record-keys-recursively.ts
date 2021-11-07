/**
 * Transform the keys of an record object recursively
 *
 * This transforms an object, modifying all of its keys using a tranform
 * function. If any of the values of the object are also record objects, their
 * keys will also be transformed, and so on.
 *
 * Note that even though Arrays are objects, this will not modify arrays that
 * it finds, so any objects contained within arrays that are properties of the
 * original object will be returned unchanged.
 */
export function mapRecordKeysRecursively(
	record: Record< string, unknown >,
	transform: ( original: string ) => string
): Record< string, unknown > {
	return Object.keys( record ).reduce( function ( mapped, key ) {
		let value = record[ key ];
		if ( isRecord( value ) ) {
			value = mapRecordKeysRecursively( value, transform );
		}
		return {
			...mapped,
			[ transform( key ) ]: value,
		};
	}, {} );
}

function isRecord( value: unknown ): value is Record< string, unknown > {
	const valueAsObject = value as Record< string, unknown > | undefined;
	return valueAsObject?.constructor === Object;
}
