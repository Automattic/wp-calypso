import { describe, expect, test } from 'vitest';
import { parseSrcset, xmpIncludes } from '../media-helper';

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

describe( 'parseSrcset', () => {
	test( 'returns the URL of each candidate', () => {
		expect( parseSrcset( 'small.webp 320w, large.webp 640w' ) ).toEqual( [
			'small.webp',
			'large.webp',
		] );
	} );

	test( 'reads candidates with no space after the comma', () => {
		expect( parseSrcset( 'small.webp 320w,large.webp 640w' ) ).toEqual( [
			'small.webp',
			'large.webp',
		] );
	} );

	test( 'keeps a comma that is part of a URL', () => {
		expect( parseSrcset( 'a.png?resize=150,150 150w, a.png?resize=300,300 300w' ) ).toEqual( [
			'a.png?resize=150,150',
			'a.png?resize=300,300',
		] );
	} );

	test( 'reads candidates that have no descriptor', () => {
		expect( parseSrcset( 'small.webp, large.webp' ) ).toEqual( [ 'small.webp', 'large.webp' ] );
	} );

	test( 'ignores surrounding whitespace and stray commas', () => {
		expect( parseSrcset( '\n\tsmall.webp 1x ,\n\tlarge.webp 2x,\n' ) ).toEqual( [
			'small.webp',
			'large.webp',
		] );
	} );

	test( 'returns nothing for an empty srcset', () => {
		expect( parseSrcset( '' ) ).toEqual( [] );
	} );
} );
