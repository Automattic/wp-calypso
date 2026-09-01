import { getComponentStackFingerprint } from '../component-stack';

describe( 'getComponentStackFingerprint', () => {
	it( 'splits the default grouping by the innermost components (Chromium frames)', () => {
		expect(
			getComponentStackFingerprint(
				'\n    at Text (https://example.com/chunk.js:1:2)\n    at Callout (https://example.com/chunk.js:3:4)'
			)
		).toEqual( [ '{{ default }}', 'Text', 'Callout' ] );
	} );

	it( 'parses Firefox and Safari frames', () => {
		expect(
			getComponentStackFingerprint( '\nText@https://example.com/chunk.js:1:2\nCallout@unknown:0:0' )
		).toEqual( [ '{{ default }}', 'Text', 'Callout' ] );
	} );

	it( 'parses bare component names', () => {
		expect( getComponentStackFingerprint( '\nText\nCallout' ) ).toEqual( [
			'{{ default }}',
			'Text',
			'Callout',
		] );
	} );

	it( 'skips host elements, which are identical across crash sites', () => {
		expect(
			getComponentStackFingerprint(
				'\n    at div (<anonymous>)\n    at span (<anonymous>)\n    at Callout (https://example.com/chunk.js:3:4)'
			)
		).toEqual( [ '{{ default }}', 'Callout' ] );
	} );

	it( 'trims to the innermost components', () => {
		const stack = Array.from(
			{ length: 20 },
			( _, i ) => `    at Component${ i } (https://example.com/chunk.js:${ i }:0)`
		).join( '\n' );

		expect( getComponentStackFingerprint( stack ) ).toEqual( [
			'{{ default }}',
			'Component0',
			'Component1',
			'Component2',
		] );
	} );

	it( 'returns undefined when there is nothing to group on', () => {
		expect( getComponentStackFingerprint( '' ) ).toBeUndefined();
		expect( getComponentStackFingerprint( null ) ).toBeUndefined();
		expect( getComponentStackFingerprint( undefined ) ).toBeUndefined();
		expect( getComponentStackFingerprint( '    at div (<anonymous>)' ) ).toBeUndefined();
	} );
} );
