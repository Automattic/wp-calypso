function ConfigFlagPlugin( babel ) {
	const { types: t } = babel;
	let defaultImportName = null;
	let defaultImportScope = null;
	let namedImportName = null;
	let namedImportScope = null;
	let namespacedImportName = null;
	let namespacedImportScope = null;

	// Check that the given call expression is `config.isEnabled( 'flag' )` with
	// `config` as the default export, and return the `flag` literal value.
	const isCallOnDefault = path => {
		const expr = path.node;
		const configBinding = path.scope.getBinding( defaultImportName );

		return defaultImportName &&
			configBinding &&
			configBinding.scope.uid === defaultImportScope &&
			expr.callee.type === 'MemberExpression' &&
			expr.callee.object.type === 'Identifier' &&
			expr.callee.object.name === defaultImportName &&
			expr.callee.property.type === 'Identifier' &&
			expr.callee.property.name === 'isEnabled' &&
			expr.arguments.length === 1 &&
			expr.arguments[ 0 ].type === 'StringLiteral'
			? expr.arguments[ 0 ].value
			: null;
	};

	// Check that the given call expression is `config.isEnabled( 'flag' )` with
	// `config` as a namespaced import, and return the `flag` literal value.
	const isNamespacedCall = path => {
		const expr = path.node;
		const configBinding = path.scope.getBinding( namespacedImportName );

		return namespacedImportName &&
			configBinding &&
			configBinding.scope.uid === namespacedImportScope &&
			expr.callee.type === 'MemberExpression' &&
			expr.callee.object.type === 'Identifier' &&
			expr.callee.object.name === namespacedImportName &&
			expr.callee.property.type === 'Identifier' &&
			expr.callee.property.name === 'isEnabled' &&
			expr.arguments.length === 1 &&
			expr.arguments[ 0 ].type === 'StringLiteral'
			? expr.arguments[ 0 ].value
			: null;
	};

	// Check that the given call expression is `isEnabled( 'flag' )`
	// and return the `flag` literal value.
	const isNamedCall = path => {
		const expr = path.node;
		const configBinding = path.scope.getBinding( namedImportName );

		return namedImportName &&
			configBinding &&
			configBinding.scope.uid === namedImportScope &&
			expr.callee.type === 'Identifier' &&
			expr.callee.name === namedImportName &&
			expr.arguments.length === 1 &&
			expr.arguments[ 0 ].type === 'StringLiteral'
			? expr.arguments[ 0 ].value
			: null;
	};

	return {
		visitor: {
			// First, let's look for the imports.
			ImportDeclaration( path ) {
				const imp = path.node;
				const source = imp.source;
				if ( source && source.value === 'config' ) {
					// We have an import of 'config'.
					const specifiers = imp.specifiers || [];

					for ( const sp of specifiers ) {
						// Default import (`import config from 'config'`)
						if ( sp.type === 'ImportDefaultSpecifier' ) {
							defaultImportName = sp.local && sp.local.name;
							defaultImportScope = path.scope.uid;
						}

						// Named import (`import { foo } from 'config'`)
						if ( sp.type === 'ImportSpecifier' && sp.imported.name === 'isEnabled' ) {
							namedImportName = sp.local && sp.local.name;
							namedImportScope = path.scope.uid;
						}

						// Namespaced import (`import * as foo from 'config'`)
						if ( sp.type === 'ImportNamespaceSpecifier' ) {
							namespacedImportName = sp.local && sp.local.name;
							namespacedImportScope = path.scope.uid;
						}
					}
				}
			},
			// Now let's look for call expressions that use those imports.
			CallExpression( path, state ) {
				if ( state && state.opts && state.opts.flags ) {
					const flag = isCallOnDefault( path ) || isNamedCall( path ) || isNamespacedCall( path );
					if ( flag && flag in state.opts.flags ) {
						path.replaceWith( t.BooleanLiteral( state.opts.flags[ flag ] ) );
					}
				}
			},
		},
	};
}

module.exports = ConfigFlagPlugin;
