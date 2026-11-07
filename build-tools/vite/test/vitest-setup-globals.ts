// PROTOTYPE (DOTMSD-1675): vm pools may lack Node's web platform classes, which nock needs. Runs
// before any setup file imports nock.
import { runInThisContext } from 'node:vm';
const nodeGlobals = runInThisContext( 'globalThis' );
for ( const name of [ 'Headers', 'Request', 'Response', 'FormData', 'TextEncoder', 'TextDecoder', 'ReadableStream', 'WritableStream', 'TransformStream', 'fetch' ] ) {
	if ( typeof ( globalThis as any )[ name ] === 'undefined' ) {
		( globalThis as any )[ name ] = nodeGlobals[ name ];
	}
}
