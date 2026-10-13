const { parseForESLint } = require( '@typescript-eslint/parser' );

// Parses TypeScript files for eslint-plugin-import's export map only, dropping type-only
// exports so a JavaScript file importing a type (which has no runtime value) is reported.
exports.parseForESLint = function ( code, options ) {
	const result = parseForESLint( code, options );
	result.ast.body = result.ast.body.map( ( node ) => {
		const isExport = node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration';
		if ( isExport && node.exportKind === 'type' ) {
			// An empty `export {}` rather than nothing: a file left without any export is no
			// longer seen as a module, and an `export *` of it would then accept any name.
			return {
				...node,
				type: 'ExportNamedDeclaration',
				exportKind: 'value',
				declaration: null,
				specifiers: [],
				source: null,
				exported: undefined,
			};
		}
		if ( node.type === 'ExportNamedDeclaration' ) {
			return {
				...node,
				specifiers: node.specifiers.filter( ( specifier ) => specifier.exportKind !== 'type' ),
			};
		}
		return node;
	} );
	return result;
};
