const { getExtractedComment } = require( '../src' );

// Minimal AST-path builders mirroring the shape getExtractedComment reads.
const comment = ( endLine, value ) => ( { loc: { end: { line: endLine } }, value } );
const path = ( startLine, leadingComments, parentPath = null ) => ( {
	node: { loc: { start: { line: startLine } }, leadingComments },
	parent: parentPath ? parentPath.node : null,
	parentPath,
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

	test( 'ignores a translator comment that is not on the node or previous line', () => {
		const result = getExtractedComment(
			path( 5, [ comment( 1, ' translators: too far away ' ) ] )
		);
		expect( result ).toBeUndefined();
	} );

	test( 'falls back to a matching comment on the parent path', () => {
		const parent = path( 2, [ comment( 2, ' translators: from parent ' ) ] );
		const result = getExtractedComment( path( 3, [], parent ) );
		expect( result ).toBe( 'from parent' );
	} );
} );
