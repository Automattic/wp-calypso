/**
 * @file React components should avoid returning text nodes directly (or numerical values which will be rendered as text). When a React component returns values other than JSX / null, Google Translate can continue to display stale values after state changes, without any error being thrown. Since this is very hard to debug it is better to avoid it altogether.
 * @author alistair-coup
 *
 * Vendored from eslint-plugin-react-google-translate@1.0.4 (getcouped/eslint-plugin-react-google-translate).
 * Kept verbatim — this rule is purely syntactic and uses no type information.
 */

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'React components should avoid returning text nodes directly (or numerical values which will be rendered as text). When a React component returns values other than JSX / null, Google Translate can continue to display stale values after state changes, without any error being thrown. Since this is very hard to debug it is better to avoid it altogether.',
			url: 'https://github.com/getcouped/eslint-plugin-react-google-translate#eslint-plugin-react-google-translate',
		},
		schema: [],
		messages: {
			'return-value-is-text-node':
				'React components should avoid returning text nodes directly (or numerical values which will be rendered as text). When a React component returns values other than JSX / null, Google Translate can continue to display stale values after state changes, without any error being thrown. Since this is very hard to debug it is better to avoid it altogether.',
		},
	},

	create( context ) {
		function getFunctionName( node ) {
			return node && node.id && node.id.name;
		}

		function getIsCapitalised( name ) {
			return name && typeof name === 'string' && name[ 0 ] === name[ 0 ].toUpperCase();
		}

		/**
		 * Recursively iterate over all areas of a function body where it is
		 * possible to return from the function and report any return statements
		 * which return a text node.
		 */
		function findAndReportReturnStatements( node ) {
			if ( node.type === 'ReturnStatement' ) {
				if (
					node.argument &&
					( node.argument.type === 'TemplateLiteral' ||
						( node.argument.type === 'Literal' &&
							( typeof node.argument.value === 'string' ||
								// we count numerical values as text nodes as within the output
								// of a JSX expression they will be rendered as text
								typeof node.argument.value === 'number' ) ) )
				) {
					context.report( {
						node,
						messageId: 'return-value-is-text-node',
					} );
				}
			}

			if ( node.type === 'BlockStatement' ) {
				const children = node.body || [];
				for ( const child of children ) {
					findAndReportReturnStatements( child );
				}
			} else if ( node.type === 'IfStatement' ) {
				findAndReportReturnStatements( node.consequent );
				if ( node.alternate ) {
					findAndReportReturnStatements( node.alternate );
				}
			} else if (
				node.type === 'ForOfStatement' ||
				node.type === 'ForInStatement' ||
				node.type === 'ForStatement' ||
				node.type === 'WhileStatement' ||
				node.type === 'DoWhileStatement'
			) {
				findAndReportReturnStatements( node.body );
			} else if ( node.type === 'SwitchStatement' ) {
				for ( const switchCase of node.cases ) {
					for ( const consequent of switchCase.consequent ) {
						findAndReportReturnStatements( consequent );
					}
				}
			} else if ( node.type === 'TryStatement' ) {
				findAndReportReturnStatements( node.block );
				if ( node.handler ) {
					findAndReportReturnStatements( node.handler.body );
				}
				if ( node.finalizer ) {
					findAndReportReturnStatements( node.finalizer );
				}
			} else {
				return null;
			}
		}

		return {
			FunctionDeclaration( node ) {
				if ( ! node.body ) {
					return;
				}

				const functionName = getFunctionName( node );
				const isCapitalised = getIsCapitalised( functionName );
				const isFunctionComponent = typeof functionName === 'string' && isCapitalised;

				if ( ! isFunctionComponent ) {
					return;
				}

				findAndReportReturnStatements( node.body );
			},
		};
	},
};
