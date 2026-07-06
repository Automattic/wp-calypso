/**
 * @file Disallow importing lodash, which has been removed from the codebase.
 * @author Automattic
 * @copyright 2026 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const MESSAGE =
	'lodash has been removed from this codebase — do not add new lodash imports. Use native ' +
	'JavaScript or a helper from `@automattic/js-utils` (see docs/coding-guidelines/javascript.md).';

// Matches `lodash` and `lodash-es`, their subpath imports (`lodash/<fn>`,
// `lodash-es/<fn>`), and the per-method `lodash.<fn>` packages — but not unrelated
// names like `lodashy` or `my-lodash`.
const isLodash = ( value ) => /^lodash(-es)?($|[/.])/.test( value );

// The statically-known string an import/require resolves to, or `undefined` when
// the source is dynamic (e.g. `import( someVariable )`) and cannot be checked.
const getStaticString = ( node ) => {
	if ( node && node.type === 'Literal' && typeof node.value === 'string' ) {
		return node.value;
	}
	if ( node && node.type === 'TemplateLiteral' && node.expressions.length === 0 ) {
		return node.quasis[ 0 ].value.cooked;
	}
	return undefined;
};

module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow importing lodash',
			category: 'Best Practices',
			// Not part of `plugin:wpcalypso/recommended`: banning lodash is a
			// wp-calypso-specific policy, enabled explicitly in the repo root config.
			recommended: false,
		},
		schema: [],
	},
	create( context ) {
		const reportIfLodash = ( node, sourceNode ) => {
			const value = getStaticString( sourceNode );
			if ( value && isLodash( value ) ) {
				context.report( { node, message: MESSAGE } );
			}
		};

		return {
			// static import
			ImportDeclaration( node ) {
				reportIfLodash( node, node.source );
			},
			// named re-export (`export { x } from …`)
			ExportNamedDeclaration( node ) {
				reportIfLodash( node, node.source );
			},
			// re-export all (`export * from …`)
			ExportAllDeclaration( node ) {
				reportIfLodash( node, node.source );
			},
			// dynamic import
			ImportExpression( node ) {
				reportIfLodash( node, node.source );
			},
			// CommonJS require. `require.resolve( … )` is intentionally not matched:
			// its callee is a member expression, and it resolves a module path
			// (build tooling does this) without importing or executing lodash.
			CallExpression( node ) {
				if ( node.callee.type === 'Identifier' && node.callee.name === 'require' ) {
					reportIfLodash( node, node.arguments[ 0 ] );
				}
			},
			// TypeScript import-equals (`import x = require( … )`)
			TSImportEqualsDeclaration( node ) {
				if ( node.moduleReference && node.moduleReference.type === 'TSExternalModuleReference' ) {
					reportIfLodash( node, node.moduleReference.expression );
				}
			},
			// TypeScript import-type query (`type X = import( … ).Foo`)
			TSImportType( node ) {
				reportIfLodash( node, node.source );
			},
		};
	},
};
