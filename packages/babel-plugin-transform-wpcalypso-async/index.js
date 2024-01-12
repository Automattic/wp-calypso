const { kebabCase } = require( 'lodash' );

function importChunk( t, name ) {
	const chunkName = 'async-load-' + kebabCase( name );

	const argumentWithMagicComments = t.addComment(
		t.stringLiteral( name ),
		'leading',
		`webpackChunkName: "${ chunkName }"`,
		false
	);

	return t.callExpression( t.import(), [ argumentWithMagicComments ] );
}

function importError( t, name ) {
	const chunkName = 'async-load-' + kebabCase( name );

	return t.newExpression( t.identifier( 'Error' ), [
		t.stringLiteral( 'ignoring load of: ' + chunkName ),
	] );
}

module.exports = ( { types: t } ) => {
	/**
	 * Nested visitor for `require` function expression hoisting. This is
	 * assigned here as a shared reference for optimized path traversal.
	 * @see https://github.com/thejameskyle/babel-handbook/blob/HEAD/translations/en/plugin-handbook.md#optimizing-nested-visitors
	 * @type {Object}
	 */
	const asyncAttributeVisitor = {
		ArrowFunctionExpression( path ) {
			// Hoist using the parent JSXAttribute's scope, since the scopes
			// from AST parse stage are not valid for replacement expression
			path.hoist( this.scope );
		},
	};

	return {
		visitor: {
			JSXAttribute( path, state ) {
				// We only transform the require prop on AsyncLoad components.
				// The component could have been imported under a different
				// name, but tracking the identifier to the import would add
				// complexity to the parsing. In other words, I'm lazy.
				const parent = path.parentPath.parent;
				if ( 'AsyncLoad' !== parent.openingElement.name.name ) {
					return;
				}

				const name = path.node.name;
				if ( 'JSXIdentifier' !== name.type || 'require' !== name.name ) {
					return;
				}

				const value = path.node.value;
				if ( 'StringLiteral' !== value.type ) {
					return;
				}

				const body = state.opts.ignore
					? t.blockStatement( [ t.throwStatement( importError( t, value.value ) ) ] )
					: importChunk( t, value.value );

				path.replaceWith(
					t.jSXAttribute( name, t.jSXExpressionContainer( t.arrowFunctionExpression( [], body ) ) )
				);

				// Traverse replacement attribute to hoist function expression
				path.traverse( asyncAttributeVisitor, { scope: path.scope } );
			},
			CallExpression( path, state ) {
				if ( 'asyncRequire' !== path.node.callee.name ) {
					return;
				}

				const argument = path.node.arguments[ 0 ];
				if ( ! argument || 'StringLiteral' !== argument.type ) {
					return;
				}

				const expr = state.opts.ignore
					? t.callExpression(
							t.memberExpression( t.identifier( 'Promise' ), t.identifier( 'reject' ) ),
							[ importError( t, argument.value ) ]
					  )
					: importChunk( t, argument.value );

				path.replaceWith( expr );
			},
		},
	};
};
