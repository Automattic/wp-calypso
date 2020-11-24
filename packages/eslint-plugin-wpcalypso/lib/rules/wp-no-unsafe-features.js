//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
	type: 'problem',
	meta: {
		messages: {
			noUnsafeFeatures: 'Usage of `{{feature}}` from `{{source}}` is not allowed',
		},
		docs: {
			description: 'Forbid unsafe features',
		},
		schema: [
			{
				type: 'object',
				additionalProperties: false,
				properties: {
					allowedImports: {
						type: 'object',
						properties: {
							[ '^@wordpress\\/[a-zA-Z0-9_-]+$' ]: {
								type: 'array',
								items: {
									type: 'array',
								},
							},
						},
					},
				},
			},
		],
	},
	create( context ) {
		const allowedImports =
			( context.options && context.options[ 0 ] && context.options[ 0 ].allowedImports ) || {};
		const reporter = makeReporter( { allowedImports, context } );

		return {
			ImportDeclaration: reporter,
			// ExportNamedDeclaration: reporter,
			// ExportAllDeclaration: reporter,
			// ImportExpression: reporter,
		};
	},
};

function makeReporter( { allowedImports, context } ) {
	return function reporter( node ) {
		const sourceModule = node.source.value.trim();

		// Only interested in @wordpress/* packages
		if ( ! sourceModule.startsWith( '@wordpress/' ) ) {
			return;
		}

		const allowedImportNames = allowedImports[ sourceModule ] || [];

		node.specifiers.forEach( ( specifierNode ) => {
			if ( specifierNode.type !== 'ImportSpecifier' ) {
				return false;
			}

			const imported = specifierNode.imported.name;

			const data = {
				source: sourceModule,
				feature: imported,
			};

			if (
				// Unstable is never allowed
				imported.startsWith( '__unstable' ) ||
				// Experimental may be allowed
				( imported.startsWith( '__experimental' ) && ! allowedImportNames.includes( imported ) )
			) {
				context.report( { messageId: 'noUnsafeFeatures', node: specifierNode, data } );
			}
		} );
	};
}
