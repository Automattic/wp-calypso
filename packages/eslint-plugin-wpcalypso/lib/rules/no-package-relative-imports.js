const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Returns the imports relative to a directory.
 * For example, if the FS is:
 *   - dir/
 *      └ subdir/
 *      └ file.js
 *      └ data.json
 *
 * It will return the array ['subdir', 'file', 'data.json']
 */
const getRelativeImports = ( relativeDir ) => {
	return fs.readdirSync( relativeDir, { withFileTypes: true } ).map( ( file ) => {
		const fileName = file.name;
		if ( file.isDirectory() ) return fileName;
		const extension = path.extname( fileName );
		if ( extension !== '.js' ) return fileName;
		return path.basename( fileName, extension );
	} );
};

/**
 * For each import (CJS and ESM), check if the import could be relative to one of the
 * configured `mapping` (eg: if you are importing 'X' and 'X' is a subdirectory of ./client)
 * If it is, prepend the import with the module (eg: `import 'X'` becomes `import 'wp-client/X'`)
 */
const reportIfPackageRelative = ( { context, node, dependency } ) => {
	const { mapping, warnOnDynamicImport } = context.options[ 0 ];

	// Because ExportNamedDeclaration and ExportAllDeclaration may not have an imported source (aka node.source)
	if ( ! dependency ) return;
	const { value: dependencyName, type: dependencyType } = dependency;

	// This part is only relevant for CJS imports
	if ( dependencyType !== 'Literal' ) {
		if ( warnOnDynamicImport ) {
			// eslint-disable-next-line no-console
			console.warn(
				`Invalid import, only literal imports are supported. File ${ context.getFilename() }:${
					node.loc.start.line
				}`
			);
		}
		return;
	}

	if ( typeof dependencyName !== 'string' ) return;

	mapping.forEach( ( { dir, module } ) => {
		const deps = getRelativeImports( dir );

		if ( deps.includes( dependencyName.split( '/' )[ 0 ] ) ) {
			context.report( {
				node,
				messageId: 'noPackageRelativeImport',
				data: {
					relativeDir: dir,
					import: dependencyName,
				},
				fix: ( fixer ) => {
					return fixer.replaceText( dependency, `'${ module }/${ dependencyName }'` );
				},
			} );
		}
	} );
};

module.exports = {
	type: 'problem',
	meta: {
		messages: {
			noPackageRelativeImport: 'Import {{import}} relative to `{{relativeDir}}` is not allowed',
			invalidImport: 'Invalid import, only literal imports are supported',
		},
		docs: {
			description: 'Forbid package-relative imports',
		},
		fixable: 'code',
		schema: [
			{
				type: 'object',
				additionalProperties: false,
				properties: {
					mapping: {
						type: 'array',
						items: {
							type: 'object',
							additionalProperties: false,
							properties: {
								dir: { type: 'string' },
								module: { type: 'string' },
							},
						},
					},
					warnOnDynamicImport: {
						type: 'boolean',
					},
				},
			},
		],
	},
	create( context ) {
		const reportESMImport = ( node ) =>
			reportIfPackageRelative( { context, node, dependency: node.source } );

		const reportCJSRequire = ( node ) =>
			reportIfPackageRelative( { context, node, dependency: node.arguments[ 0 ] } );

		return {
			ImportDeclaration: reportESMImport,
			ExportNamedDeclaration: reportESMImport,
			ExportAllDeclaration: reportESMImport,
			ImportExpression: reportESMImport,
			CallExpression: ( node ) => {
				if (
					node.callee &&
					node.callee.type === 'Identifier' &&
					node.callee.name === 'require' &&
					node.arguments.length === 1
				) {
					reportCJSRequire( node );
				}
			},
		};
	},
};
