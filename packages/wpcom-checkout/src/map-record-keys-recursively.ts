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
