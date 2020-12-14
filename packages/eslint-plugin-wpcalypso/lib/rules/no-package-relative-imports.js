const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Returns the imports relative to a directory.
 * For example, if the FS is:
 * - dir/
 *   ├ subdir/
 *   ├ file.js
 *   ├ data.json
 *   └ test.txt
 *
 * It will return the array ['subdir', 'file', 'data', 'test.txt]
 *
 * @param relativeDir The directory to find relative imports to
 * @param automaticExtensions {array} List of extensions that are automatically tried when importing a file. Defaults to [".js",".json",".node"] (default Node.js extensions)
 */
const getRelativeImports = ( relativeDir, automaticExtensions = [ '.js', '.json', '.node' ] ) => {
	return fs.readdirSync( relativeDir, { withFileTypes: true } ).map( ( file ) => {
		const fileName = file.name;

		// Directories can be import directly
		if ( file.isDirectory() ) {
			return fileName;
		}

		// If the file extension is in the automatic extensions, they can be imported
		// directly (eg: index.js can be improted as 'index')
		const extension = path.extname( fileName );
		if ( automaticExtensions.includes( extension ) ) {
			return path.basename( fileName, extension );
		}

		// Else, it needs the full name to be imported (eg: import 'file.txt'). This is
		// valid because webpack may know how to impor that extension.
		return fileName;
	} );
};

/**
 * For each import (CJS or ESM), check if the import could be relative to one of the
 * configured `mappings`. If it is, prepend the import with the module.
 *
 * Example:
 *
 * With mappings `[ {dir: '/app/client', module: 'calypso'} ]`
 * If the code is importing `foo` and `foo` is a subdirectory of `/app/client/`, this rule
 * will warn the user and optionally replace it with `calypso/foo`
 *
 * @param {object} arg Function arguments
 * @param {object} arg.context The context as provided by ESLint (https://eslint.org/docs/developer-guide/working-with-rules#the-context-object)
 * @param {object} arg.node A node representing the ESM/CJS import that violates the rule
 * @param {object} arg.mappings The mappings dir->package used to replace package-relative imports
 * @param {object} arg.automaticExtensions Array with the extensions to try to import automatically
 * @param {object} arg.importedModule A node representing the dependency being imported
 */
const report = ( { context, node, mappings, automaticExtensions, importedModule } ) =>
	mappings.forEach( ( { dir, module } ) => {
		const deps = getRelativeImports( dir, automaticExtensions );

		if ( deps.includes( importedModule.value.split( '/' )[ 0 ] ) ) {
			context.report( {
				node,
				messageId: 'noPackageRelativeImport',
				data: {
					relativeDir: dir,
					import: importedModule.value,
				},
				fix: ( fixer ) => {
					const quote = importedModule.raw[ 0 ];
					return fixer.replaceText(
						importedModule,
						`${ quote }${ module }/${ importedModule.value }${ quote }`
					);
				},
			} );
		}
	} );

/**
 * Checks if an import is a Literal string or somethign else (eg: an expression)
 *
 * @param {object} importedModule A node representing the dependency being imported
 */
const isLiteralImport = ( importedModule ) =>
	importedModule.type === 'Literal' && typeof importedModule.value === 'string';

/**
 * Checks if an import is a bare import (it doesn't start with with . or /)
 *
 * @param {object} importedModule A node representing the dependency being imported
 * @param {string} importedModule.value Name of the imported module
 */
const isBareImport = ( { value } ) => {
	return ! value.startsWith( '.' ) && ! value.startsWith( '/' );
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
					mappings: {
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
					warnOnNonLiteralImport: {
						type: 'boolean',
					},
					automaticExtensions: {
						type: 'array',
						items: {
							type: 'string',
						},
					},
				},
			},
		],
	},
	create( context ) {
		const reportImport = ( node, importedModule ) => {
			const warnOnNonLiteralImport = context.options[ 0 ].warnOnNonLiteralImport;

			// ExportNamedDeclaration and ExportAllDeclaration may not import a module
			if ( ! importedModule ) return;

			if ( ! isLiteralImport( importedModule ) ) {
				if ( warnOnNonLiteralImport ) {
					// eslint-disable-next-line no-console
					console.warn(
						`Invalid import, only literal imports are supported. File ${ context.getFilename() }:${
							node.loc.start.line
						}`
					);
				}
				return;
			}

			if ( ! isBareImport( importedModule ) ) {
				return;
			}

			report( {
				context,
				node,
				mappings: context.options[ 0 ].mappings,
				automaticExtensions: context.options[ 0 ].automaticExtensions,
				importedModule,
			} );
		};

		return {
			ImportDeclaration: ( node ) => reportImport( node, node.source ),
			ExportNamedDeclaration: ( node ) => reportImport( node, node.source ),
			ExportAllDeclaration: ( node ) => reportImport( node, node.source ),
			ImportExpression: ( node ) => reportImport( node, node.source ),
			CallExpression: ( node ) => {
				if (
					node.callee &&
					node.callee.type === 'Identifier' &&
					( ( node.callee.name === 'require' && node.arguments.length === 1 ) ||
						node.callee.name === 'asyncRequire' )
				) {
					return reportImport( node, node.arguments[ 0 ] );
				}
			},
			JSXElement: ( node ) => {
				if ( node.openingElement.name.name === 'AsyncLoad' ) {
					const requireAttribute = node.openingElement.attributes
						.filter( ( attr ) => attr.type === 'JSXAttribute' )
						.find( ( attr ) => attr.name.name === 'require' );
					if ( requireAttribute ) {
						reportImport( node, requireAttribute.value );
					}
				}
			},
		};
	},
};
