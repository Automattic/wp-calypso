import { limits, record, safeKey } from './validation-utils';
import type { DataModel, EditableValue, JsonScalar, JsonValue } from './types';

export function bindingPath( value: unknown ): value is string {
	return (
		typeof value === 'string' &&
		value.length <= limits.path &&
		/^\/[A-Za-z_][A-Za-z0-9_-]*(?:\/[A-Za-z_][A-Za-z0-9_-]*)*$/.test( value ) &&
		value.slice( 1 ).split( '/' ).every( safeKey )
	);
}

export function readBinding( data: DataModel, path: string ): JsonValue | undefined {
	if ( ! bindingPath( path ) ) {
		return undefined;
	}
	let value: unknown = data;
	for ( const key of path.slice( 1 ).split( '/' ) ) {
		if ( ! record( value ) || ! Object.hasOwn( value, key ) ) {
			return undefined;
		}
		value = value[ key ];
	}
	return value as JsonValue;
}

export function writeBinding(
	data: DataModel,
	path: string,
	value: EditableValue
): DataModel | null {
	if ( readBinding( data, path ) === undefined ) {
		return null;
	}
	const copy: DataModel = JSON.parse( JSON.stringify( data ) );
	const parts = path.slice( 1 ).split( '/' );
	let parent: { [ key: string ]: JsonValue } = copy;
	for ( const key of parts.slice( 0, -1 ) ) {
		const child = parent[ key ];
		if ( ! record( child ) ) {
			return null;
		}
		parent = child as { [ key: string ]: JsonValue };
	}
	parent[ parts[ parts.length - 1 ] ] = Array.isArray( value ) ? [ ...value ] : value;
	return copy;
}

export function scalarText( value: JsonScalar ): string {
	return value === null ? '' : String( value );
}
