// JSDOM doesn't provide the Fetch API classes nor some web platform globals, but `nock` (via `@mswjs/interceptors`) requires them.
// Borrow Node's native implementations from the outer (non-sandboxed) context.
{
	const nodeGlobals = require( 'node:vm' ).runInThisContext( 'globalThis' );
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
	] ) {
		if ( typeof global[ name ] === 'undefined' ) {
			global[ name ] = nodeGlobals[ name ];
		}
	}
}
