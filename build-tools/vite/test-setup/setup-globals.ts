// The vm pools' contexts lack some of Node's web platform classes, which nock needs. This runs
// before any setup file imports nock.
import { runInThisContext } from 'node:vm';

const nodeGlobals = runInThisContext( 'globalThis' );
for ( const name of [
	'Headers',
	'Request',
	'Response',
	'FormData',
	'TextEncoder',
	'TextDecoder',
	'ReadableStream',
	'WritableStream',
	'TransformStream',
	'fetch',
] ) {
	if ( typeof ( globalThis as Record< string, unknown > )[ name ] === 'undefined' ) {
		( globalThis as Record< string, unknown > )[ name ] = nodeGlobals[ name ];
	}
}
