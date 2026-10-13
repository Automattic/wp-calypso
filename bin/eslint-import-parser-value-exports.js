const { parseForESLint } = require( '@typescript-eslint/parser' );

// Parses TypeScript files for eslint-plugin-import's export map only, dropping type-only
// exports so a JavaScript file importing a type (which has no runtime value) is reported.
exports.parseForESLint = function ( code, options ) {
	const result = parseForESLint( code, options );
	result.ast.body = result.ast.body.filter(
		( node ) =>
			! (
				( node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration' ) &&
				node.exportKind === 'type'
			)
	);
	for ( const node of result.ast.body ) {
		if ( node.type === 'ExportNamedDeclaration' ) {
			node.specifiers = node.specifiers.filter( ( specifier ) => specifier.exportKind !== 'type' );
		}
	}
	return result;
};
