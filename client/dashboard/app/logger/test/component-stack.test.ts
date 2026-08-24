import { attachComponentStackAsCause } from '../component-stack';

describe( 'attachComponentStackAsCause', () => {
	it( 'attaches a synthetic cause whose stack holds the component frames', () => {
		const error = new Error( 'Boom' );
		attachComponentStackAsCause(
			error,
			'\n    at Text (https://example.com/chunk.js:1:2)\n    at Callout (https://example.com/chunk.js:3:4)'
		);

		const cause = ( error as { cause?: Error } ).cause;
		expect( cause ).toBeInstanceOf( Error );
		expect( cause?.name ).toBe( 'ReactComponentStack' );
		expect( cause?.stack ).toContain( 'at Text (https://example.com/chunk.js:1:2)' );
		expect( cause?.stack ).toContain( 'at Callout (https://example.com/chunk.js:3:4)' );
	} );

	it( 'trims the stack to the innermost frames', () => {
		const frames = Array.from(
			{ length: 20 },
			( _, i ) => `    at Component${ i } (https://example.com/chunk.js:${ i }:0)`
		).join( '\n' );

		const error = new Error( 'Boom' );
		attachComponentStackAsCause( error, frames );

		const stack = ( error as { cause?: Error } ).cause?.stack ?? '';
		expect( stack ).toContain( 'at Component0 ' );
		expect( stack ).toContain( 'at Component7 ' );
		expect( stack ).not.toContain( 'at Component8 ' );
	} );

	it( 'does not clobber an existing cause', () => {
		const original = new Error( 'original cause' );
		const error = new Error( 'Boom' );
		( error as { cause?: unknown } ).cause = original;

		attachComponentStackAsCause( error, '    at Text (https://example.com/chunk.js:1:2)' );

		expect( ( error as { cause?: unknown } ).cause ).toBe( original );
	} );

	it( 'does nothing for an empty or frameless stack', () => {
		const error = new Error( 'Boom' );
		attachComponentStackAsCause( error, '' );
		expect( ( error as { cause?: unknown } ).cause ).toBeUndefined();

		attachComponentStackAsCause( error, 'no frames here' );
		expect( ( error as { cause?: unknown } ).cause ).toBeUndefined();
	} );
} );
