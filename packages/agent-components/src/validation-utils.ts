export const limits = {
	bytes: 65536,
	components: 128,
	depth: 16,
	string: 8192,
	label: 120,
	options: 100,
	path: 1024,
	dataNodes: 1024,
} as const;

export function record( value: unknown ): value is Record< string, unknown > {
	return (
		value !== null &&
		typeof value === 'object' &&
		! Array.isArray( value ) &&
		( Object.getPrototypeOf( value ) === Object.prototype ||
			Object.getPrototypeOf( value ) === null )
	);
}

export function keys(
	value: Record< string, unknown >,
	required: string[],
	optional: string[] = []
) {
	return (
		required.every( ( key ) => Object.hasOwn( value, key ) ) &&
		Object.keys( value ).every( ( key ) => required.includes( key ) || optional.includes( key ) )
	);
}

export function string( value: unknown, maximum: number = limits.string ): value is string {
	if ( typeof value !== 'string' ) {
		return false;
	}
	const characters = Array.from( value );
	return (
		characters.length <= maximum &&
		characters.every(
			( character ) =>
				character.length === 2 ||
				character.charCodeAt( 0 ) < 0xd800 ||
				character.charCodeAt( 0 ) > 0xdfff
		)
	);
}

export function text( value: unknown, maximum: number = limits.string ): value is string {
	return string( value, maximum ) && value.length > 0;
}

export function safeKey( key: string ): boolean {
	return (
		/^[A-Za-z_][A-Za-z0-9_-]*$/.test( key ) &&
		! [ '__proto__', 'constructor', 'prototype' ].includes( key )
	);
}

export function identifier( value: unknown, maximum = 64 ): value is string {
	return (
		typeof value === 'string' &&
		value.length > 0 &&
		value.length <= maximum &&
		/^[a-zA-Z0-9_.:-]+$/.test( value ) &&
		! [ '__proto__', 'constructor', 'prototype' ].includes( value )
	);
}

export function locale( value: unknown ): value is string {
	return (
		typeof value === 'string' &&
		value.length <= 64 &&
		/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test( value )
	);
}

export function expiry( value: unknown ): value is string {
	return (
		typeof value === 'string' &&
		/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test( value ) &&
		Number.isFinite( Date.parse( value ) )
	);
}

export function boundedJson( value: unknown ): boolean {
	try {
		const serialized = JSON.stringify( value );
		return (
			typeof serialized === 'string' &&
			new TextEncoder().encode( serialized ).length <= limits.bytes
		);
	} catch {
		return false;
	}
}
