import { runInThisContext } from 'node:vm';
const nodeGlobals = runInThisContext( 'globalThis' );
for ( const name of [ 'Headers', 'Request', 'Response', 'FormData', 'TextEncoder', 'TextDecoder', 'ReadableStream', 'WritableStream', 'TransformStream', 'fetch' ] ) {
	if ( typeof ( globalThis as any )[ name ] === 'undefined' ) {
		( globalThis as any )[ name ] = nodeGlobals[ name ];
	}
}
