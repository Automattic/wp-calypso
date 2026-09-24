/**
 * @file Conditionally rendered text nodes should be wrapped in an element (for example, a <span>), otherwise Google Translate will cause a browser error.
 * @author alistair-coup
 *
 * Vendored from eslint-plugin-react-google-translate@1.0.4 (getcouped/eslint-plugin-react-google-translate).
 * Trimmed: Calypso lints without type-aware parsing, so the type-checking branch is
 * removed and the rule runs purely on the name-based fallback. The i18n callee names
 * are extended to cover @wordpress/i18n (which the upstream rule does not recognise).
 */

// Functions whose return value renders as — or emits — bare text nodes. Includes
// @wordpress/i18n (__, _x, _n, _nx, sprintf), react-intl/generic (formatMessage, t)
// and i18n-calypso (translate). Also createInterpolateElement, which returns a
// transparent Fragment, so its string children render as bare text nodes in the
// parent — making a conditional call site the same crash vector as a bare __().
// The rule runs without type info, so we match these by callee name.
const TEXT_NODE_FUNCTION_NAMES = new Set( [
	'formatMessage',
	't',
	'__',
	'_x',
	'_n',
	'_nx',
	'sprintf',
	'translate',
	'createInterpolateElement',
] );

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Conditionally rendered text nodes should be wrapped in an element (for example, a `<span>`), otherwise Google Translate can cause a browser error.',
			url: 'https://github.com/getcouped/eslint-plugin-react-google-translate#eslint-plugin-react-google-translate',
		},
		schema: [],
		messages: {
			'conditional-text-node':
				'Conditionally rendered text nodes with siblings (elements or nodes), when rendered as a direct child of a JSX element, should be wrapped in an element (for example, a `<span>`) to prevent Google Translate causing a browser error while manipulating the DOM. This also applies to return values from functions, so `getString()` should become `<span>{getString()}</span>`.',
			'text-node-preceded-by-conditional':
				'Text nodes which are preceded by a conditional expression, when rendered as a direct child of a JSX element, should be wrapped in an element (for example, a `<span>`) to prevent Google Translate causing a browser error while manipulating the DOM. This also applies to return values from functions, so `getString()` should become `<span>{getString()}</span>`.',
		},
	},

	create( context ) {
		function isConditionallyRendered( node ) {
			return (
				node.parent &&
				( node.parent.type === 'ConditionalExpression' || node.parent.type === 'LogicalExpression' )
			);
		}

		function isChildOfJSXExpressionContainer( node ) {
			return node.parent && node.parent.type === 'JSXExpressionContainer';
		}

		function isChildOfJSXElement( node ) {
			return node.parent && node.parent.type === 'JSXElement';
		}

		function hasSiblings( node ) {
			return (
				node.parent &&
				node.parent.children &&
				node.parent.children.length > 1 &&
				node.parent.children.some(
					( child ) => ! Object.is( child, node ) && ! isWhitespace( child )
				)
			);
		}

		function isWhitespace( node ) {
			return (
				( node.type === 'Literal' &&
					typeof node.value === 'string' &&
					node.value !== '' &&
					node.value.trim() === '' ) ||
				( node.type === 'JSXText' &&
					typeof node.value === 'string' &&
					node.value !== '' &&
					node.value.trim() === '' )
			);
		}

		function conditionalSiblingsPrecedeNode( node ) {
			return (
				node.parent &&
				node.parent.children &&
				node.parent.children
					.filter(
						( child ) =>
							( child.range ? child.range[ 0 ] : child.start ) <
								( node.range ? node.range[ 0 ] : node.start ) && ! isWhitespace( child )
					)
					.some(
						( child ) =>
							child.type === 'JSXExpressionContainer' &&
							child.expression &&
							( child.expression.type === 'ConditionalExpression' ||
								child.expression.type === 'LogicalExpression' )
					)
			);
		}

		// walk up through nested conditionals to allow reporting problematic
		// nested values
		function getOutermostConditional( node ) {
			let current = node;
			while (
				current.parent &&
				( current.parent.type === 'ConditionalExpression' ||
					current.parent.type === 'LogicalExpression' )
			) {
				current = current.parent;
			}
			return current;
		}

		function isProblematicConditional( node ) {
			if ( ! isConditionallyRendered( node ) ) {
				return false;
			}
			const outermost = getOutermostConditional( node );
			return (
				isChildOfJSXExpressionContainer( outermost ) &&
				isChildOfJSXElement( outermost.parent ) &&
				hasSiblings( outermost.parent )
			);
		}

		function functionWasCalled( node ) {
			let parent = node.parent;
			while ( parent ) {
				if ( parent.type === 'CallExpression' ) {
					return true;
				} else if ( parent.type === 'ReturnStatement' ) {
					return false;
				}
				parent = parent.parent;
			}
			return false;
		}

		// check if node is used as a condition (e.g. A && B && C where A and B are
		// conditions, or the test of a ternary)
		function isCondition( node ) {
			let current = node;
			while ( current.parent && current.parent.type === 'LogicalExpression' ) {
				if ( Object.is( current.parent.left, current ) ) {
					return true;
				}
				current = current.parent;
			}
			if ( current.parent && current.parent.type === 'ConditionalExpression' ) {
				return Object.is( current.parent.test, current );
			}
			return false;
		}

		function isBinaryExpression( node ) {
			if ( node.parent && node.parent.type === 'BinaryExpression' ) {
				return isCondition( node.parent );
			}
			return false;
		}

		function getCallExpression( node ) {
			let parent = node.parent;
			while ( parent ) {
				if ( parent.type === 'CallExpression' ) {
					return parent;
				}
				parent = parent.parent;
			}
			return null;
		}

		return {
			// conditionally rendered text nodes (string literals, or other literals
			// that are coerced to strings)
			Literal( node ) {
				if (
					node.value !== null &&
					typeof node.value !== 'boolean' &&
					! isWhitespace( node ) &&
					isProblematicConditional( node )
				) {
					context.report( {
						node,
						messageId: 'conditional-text-node',
					} );
				}
			},
			// conditionally rendered text nodes derived from template literal
			// expressions
			TemplateLiteral( node ) {
				if ( ! isWhitespace( node ) && isProblematicConditional( node ) ) {
					context.report( {
						node,
						messageId: 'conditional-text-node',
					} );
				}
			},
			// static JSX text nodes preceded by a conditional expression
			JSXText( node ) {
				if (
					! isWhitespace( node ) &&
					hasSiblings( node ) &&
					conditionalSiblingsPrecedeNode( node )
				) {
					context.report( {
						node,
						messageId: 'text-node-preceded-by-conditional',
					} );
				}
			},
			// conditionally rendered text nodes generated from a call to an i18n
			// function (matched by callee name, since type info is unavailable)
			CallExpression( node ) {
				if ( isCondition( node ) ) {
					return;
				}
				if (
					node.callee.type === 'Identifier' &&
					TEXT_NODE_FUNCTION_NAMES.has( node.callee.name ) &&
					node.arguments.length > 0
				) {
					if ( isProblematicConditional( node ) ) {
						context.report( { node, messageId: 'conditional-text-node' } );
					} else if (
						isChildOfJSXElement( node.parent ) &&
						hasSiblings( node.parent ) &&
						conditionalSiblingsPrecedeNode( node.parent )
					) {
						context.report( { node, messageId: 'text-node-preceded-by-conditional' } );
					}
				}
			},
			// text nodes which are derived from object properties
			MemberExpression( node ) {
				if ( isCondition( node ) || isBinaryExpression( node ) ) {
					return;
				}
				if ( isProblematicConditional( node ) ) {
					context.report( {
						node,
						messageId: 'conditional-text-node',
					} );
				}
			},
			// text nodes derived from optional chaining (e.g. some?.cool?.beans)
			ChainExpression( node ) {
				if ( isCondition( node ) || isBinaryExpression( node ) ) {
					return;
				}
				if ( isProblematicConditional( node ) ) {
					context.report( {
						node,
						messageId: 'conditional-text-node',
					} );
				}
			},
			// conditionally rendered `toString` / `toLocaleString` calls
			Identifier( node ) {
				if (
					( node.name === 'toLocaleString' || node.name === 'toString' ) &&
					functionWasCalled( node )
				) {
					const callExpression = getCallExpression( node );
					if ( callExpression && isProblematicConditional( callExpression ) ) {
						context.report( {
							node: callExpression,
							messageId: 'conditional-text-node',
						} );
					}
				}
			},
		};
	},
};
