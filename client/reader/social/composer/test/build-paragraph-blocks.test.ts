import { buildParagraphBlocks } from '../build-paragraph-blocks';

describe( 'buildParagraphBlocks', () => {
	it( 'wraps a single line in a wp:paragraph block', () => {
		expect( buildParagraphBlocks( 'hello world' ) ).toBe(
			[ '<!-- wp:paragraph -->', '<p>hello world</p>', '<!-- /wp:paragraph -->' ].join( '\n' )
		);
	} );

	it( 'splits on blank lines into separate paragraph blocks', () => {
		const out = buildParagraphBlocks( 'first paragraph\n\nsecond paragraph' );
		expect( out ).toBe(
			[
				'<!-- wp:paragraph -->',
				'<p>first paragraph</p>',
				'<!-- /wp:paragraph -->',
				'',
				'<!-- wp:paragraph -->',
				'<p>second paragraph</p>',
				'<!-- /wp:paragraph -->',
			].join( '\n' )
		);
	} );

	it( 'turns single newlines inside a paragraph into <br>', () => {
		const out = buildParagraphBlocks( 'line one\nline two' );
		expect( out ).toContain( '<p>line one<br>line two</p>' );
	} );

	it( 'collapses runs of blank lines into one paragraph break', () => {
		const out = buildParagraphBlocks( 'a\n\n\n\nb' );
		const paragraphCount = ( out.match( /<!-- wp:paragraph -->/g ) ?? [] ).length;
		expect( paragraphCount ).toBe( 2 );
	} );

	it( 'HTML-escapes ampersands and angle brackets in paragraph text', () => {
		const out = buildParagraphBlocks( '5 < 6 & "ok"' );
		expect( out ).toContain( '<p>5 &lt; 6 &amp; "ok"</p>' );
	} );

	it( 'escapes literal HTML tags rather than passing them through', () => {
		const out = buildParagraphBlocks( '<br>' );
		expect( out ).toContain( '<p>&lt;br&gt;</p>' );
	} );

	it( 'normalizes CRLF line endings', () => {
		const out = buildParagraphBlocks( 'one\r\n\r\ntwo' );
		const paragraphCount = ( out.match( /<!-- wp:paragraph -->/g ) ?? [] ).length;
		expect( paragraphCount ).toBe( 2 );
		expect( out ).toContain( '<p>one</p>' );
		expect( out ).toContain( '<p>two</p>' );
	} );

	it( 'returns an empty string for empty or whitespace-only input', () => {
		expect( buildParagraphBlocks( '' ) ).toBe( '' );
		expect( buildParagraphBlocks( '   ' ) ).toBe( '' );
		expect( buildParagraphBlocks( '\n\n\n' ) ).toBe( '' );
	} );
} );
