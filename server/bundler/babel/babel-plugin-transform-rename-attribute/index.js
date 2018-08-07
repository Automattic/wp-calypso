/** @format */

module.exports = ( { types: t } ) => {
	return {
		visitor: {
			// Ensure correct loading order with `babel-plugin-react-css-modules`
			// by having the same JSXElement type as it uses to traverse AST.
			JSXElement( path, state ) {
				const {
					opts: { from, to },
				} = state;

				path.node.openingElement.attributes.forEach( attribute => {
					if ( typeof attribute.name !== 'undefined' && attribute.name.name === from ) {
						attribute.name = t.JSXIdentifier( to );
					}
				} );
			},
		},
	};
};
