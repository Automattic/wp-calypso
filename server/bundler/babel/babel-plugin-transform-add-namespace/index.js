/** @format */

module.exports = ( { types: t } ) => {
	return {
		visitor: {
			JSXOpeningElement( path, state ) {
				const namespace = state.opts.namespace;

				const attribute = t.jsxAttribute(
					t.jsxIdentifier( namespace ),
					t.jsxExpressionContainer( t.stringLiteral( '' ) )
				);

				path.container.openingElement.attributes.push( attribute );
			},
		},
	};
};
