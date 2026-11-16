import { describe, expect, test } from 'vitest';
import { xmpIncludes } from '../media-helper';

const MARKER = 'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia';
const packet = ( content: string ) =>
	`<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF>${ content }</rdf:RDF></x:xmpmeta>`;
const image = ( ...parts: string[] ) =>
	Buffer.from( `\x89PNG${ parts.join( '\x00IDAT\xff' ) }`, 'latin1' );

describe( 'xmpIncludes', () => {
	test( 'finds text inside the XMP packet', () => {
		expect( xmpIncludes( image( packet( MARKER ) ), MARKER ) ).toBe( true );
	} );

	test( 'ignores text outside the XMP packet', () => {
		expect( xmpIncludes( image( MARKER, packet( 'digitalCapture' ), MARKER ), MARKER ) ).toBe(
			false
		);
	} );

	test( 'ignores text between two XMP packets', () => {
		expect(
			xmpIncludes( image( packet( 'digitalCapture' ), MARKER, packet( 'digitalCapture' ) ), MARKER )
		).toBe( false );
	} );

	test( 'finds text in a later packet when the first lacks it', () => {
		expect( xmpIncludes( image( packet( 'digitalCapture' ), packet( MARKER ) ), MARKER ) ).toBe(
			true
		);
	} );

	test( 'returns false when there is no XMP packet', () => {
		expect( xmpIncludes( image( MARKER ), MARKER ) ).toBe( false );
	} );

	test( 'returns false for an unterminated packet', () => {
		expect( xmpIncludes( image( `<x:xmpmeta>${ MARKER }` ), MARKER ) ).toBe( false );
	} );
} );
