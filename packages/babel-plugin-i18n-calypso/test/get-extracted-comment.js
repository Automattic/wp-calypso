const { getExtractedComment } = require( '../src' );

// Minimal AST-path builders mirroring the shape getExtractedComment reads.
const comment = ( endLine, value ) => ( { loc: { end: { line: endLine } }, value } );
const path = ( startLine, leadingComments ) => ( {
	node: { loc: { start: { line: startLine } }, leadingComments },
	parent: null,
	parentPath: null,
} );

describe( 'getExtractedComment', () => {
	test( 'keeps the first matching translator comment when several are adjacent', () => {
		const result = getExtractedComment(
			path( 2, [
				comment( 1, ' translators: first comment ' ),
				comment( 1, ' translators: second comment ' ),
			] )
		);
		expect( result ).toBe( 'first comment' );
	} );
} );
