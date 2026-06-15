const ERROR_MESSAGE =
	'The `require` prop of AsyncLoad must reference a top-level constant, not an inline function or local variable.';

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
	meta: {
		type: 'problem',
		messages: {
			requireTopLevel: ERROR_MESSAGE,
		},
		schema: [],
	},
	ERROR_MESSAGE,
	create( context ) {
		return {
			JSXAttribute( node ) {
				if (
					node.name.name !== 'require' ||
					node.parent.type !== 'JSXOpeningElement' ||
					node.parent.name.name !== 'AsyncLoad'
				) {
					return;
				}

				const value = node.value;
				if ( ! value || value.type !== 'JSXExpressionContainer' ) {
					return;
				}

				const expr = value.expression;
				if ( expr.type === 'Identifier' && isDefinedAtTopLevel( context, expr ) ) {
					return;
				}

				context.report( {
					node: expr,
					messageId: 'requireTopLevel',
				} );
			},
		};
	},
};

function isDefinedAtTopLevel( context, node ) {
	const scope = context.getSourceCode().getScope( node );
	const ref = scope.references.find( ( r ) => r.identifier === node );
	if ( ! ref || ! ref.resolved ) {
		return false;
	}
	const defScope = ref.resolved.scope;
	return defScope.type === 'module' || defScope.type === 'global';
}
