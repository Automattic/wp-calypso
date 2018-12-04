/** @format */
/**
 * @fileoverview Ensure JSX className adheres to CSS namespace guidelines
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const path = require( 'path' );

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule = ( module.exports = function( context ) {
	const rootFiles = ( context.options[ 0 ] || {} ).rootFiles || rule.DEFAULT_ROOT_FILES;

	function isModuleExportNode( node ) {
		return (
			'ExpressionStatement' === node.type &&
			'AssignmentExpression' === node.expression.type &&
			'MemberExpression' === node.expression.left.type &&
			'module' === node.expression.left.object.name &&
			'exports' === node.expression.left.property.name
		);
	}

	function isIdentifierInDescendents( node, name ) {
		switch ( node.type ) {
			case 'Identifier':
				return node.name === name;

			case 'CallExpression':
				return node.arguments.some( function( argNode ) {
					return isIdentifierInDescendents( argNode, name );
				} );
		}

		return false;
	}

	function isRenderCallExpression( node ) {
		let calleeName;
		if ( 'CallExpression' !== node.type ) {
			return false;
		}

		if ( 'MemberExpression' === node.callee.type ) {
			calleeName = node.callee.property.name;
		} else if ( 'Identifier' === node.callee.type ) {
			calleeName = node.callee.name;
		}

		return calleeName && 'render' === calleeName;
	}

	function isRenderFunction( node ) {
		if ( 'FunctionExpression' !== node.type ) {
			return false;
		}

		if ( 'Property' === node.parent.type ) {
			return 'init' === node.parent.kind && 'render' === node.parent.key.name;
		}

		if ( 'MethodDefinition' === node.parent.type ) {
			return 'render' === node.parent.key.name;
		}

		return false;
	}

	function isFunctionType( node ) {
		return (
			-1 !==
			[ 'FunctionExpression', 'FunctionDeclaration', 'ArrowFunctionExpression' ].indexOf(
				node.type
			)
		);
	}

	function getFunctionReturnValue( node ) {
		let i, bodyNode;

		// An arrow function expression is one whose return statement is
		// implicit. It does not have a body block.
		//
		// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
		if ( 'ArrowFunctionExpression' === node.type && node.expression ) {
			return node.body;
		}

		for ( i = 0; i < node.body.body.length; i++ ) {
			bodyNode = node.body.body[ i ];
			if ( 'ReturnStatement' === bodyNode.type ) {
				return bodyNode.argument;
			}
		}
	}

	function isSameIdentifier( nodeA, nodeB ) {
		if ( ! nodeA || ! nodeB ) {
			return false;
		}

		if ( 'Identifier' !== nodeA.type || 'Identifier' !== nodeB.type ) {
			return false;
		}

		return nodeA.name === nodeB.name;
	}

	function isFolderRootFile( filename ) {
		return rootFiles.indexOf( path.basename( filename ) ) !== -1;
	}

	function isRootElementInFile( node ) {
		let isElementReturnArg,
			elementAssignedIdentifier,
			parent,
			functionExpression,
			functionName,
			isRoot;

		const element = node.parent.parent;

		switch ( element.parent.type ) {
			case 'ArrowFunctionExpression':
				isElementReturnArg = element.parent.expression;
				break;

			case 'ReturnStatement':
				isElementReturnArg = true;
				break;

			case 'VariableDeclarator':
				elementAssignedIdentifier = element.parent.id;
				break;
		}

		parent = element;

		do {
			parent = parent.parent;

			// Abort if render call expression (i.e. ReactDOM.render)
			if ( isRenderCallExpression( parent ) ) {
				return null;
			}

			// Continue through ancestors if we've already determined whether
			// this is root, to ensure we're not in a render call expression
			if ( undefined !== isRoot ) {
				continue;
			}

			// If wrapped in a JSX element, the node is a child
			if ( 'JSXElement' === parent.type ) {
				isRoot = false;
			}

			if ( isFunctionType( parent ) ) {
				functionExpression = parent;

				// If inside function expression, check that the name of the
				// property is "render" (React.createClass or Component class)
				if ( isRenderFunction( parent ) ) {
					isRoot = true;
				}

				// If wrapped in function declaration, check the declaration
				// is part of a default export (stateless function component)
				switch ( parent.type ) {
					case 'ArrowFunctionExpression':
					case 'FunctionDeclaration':
						if (
							'ExportDefaultDeclaration' === parent.parent.type ||
							isModuleExportNode( parent.parent )
						) {
							isRoot = true;
						}
						break;

					case 'FunctionExpression':
						if (
							'AssignmentExpression' === parent.parent.type &&
							isModuleExportNode( parent.parent.parent )
						) {
							isRoot = true;
						}
				}

				// If we suspect the element is the root, confirm that it's the
				// return value of the function
				if (
					isRoot &&
					! isElementReturnArg &&
					! isSameIdentifier( elementAssignedIdentifier, getFunctionReturnValue( parent ) )
				) {
					isRoot = false;
				}
			}

			// If we've exhausted parent options, check to see whether exports
			// refer to last visited function expression
			if ( 'Program' === parent.type && functionExpression ) {
				switch ( functionExpression.type ) {
					case 'FunctionDeclaration':
						if ( functionExpression.id ) {
							functionName = functionExpression.id.name;
						}
						break;

					case 'ArrowFunctionExpression':
						if ( 'VariableDeclarator' === functionExpression.parent.type ) {
							functionName = functionExpression.parent.id.name;
						}
						break;
				}

				isRoot =
					!! functionName &&
					parent.body.some( function( programNode ) {
						if ( 'ExportDefaultDeclaration' === programNode.type ) {
							return isIdentifierInDescendents( programNode.declaration, functionName );
						}

						// `module.exports` assignment, check that right-side
						// assignment value matches function name
						if ( isModuleExportNode( programNode ) ) {
							return isIdentifierInDescendents( programNode.expression.right, functionName );
						}

						return false;
					} );
			}
		} while ( parent.parent );

		return !! isRoot;
	}

	return {
		JSXAttribute: function( node ) {
			let rawClassName, expected;

			if ( 'className' !== node.name.name ) {
				return;
			}

			if ( 'JSXExpressionContainer' === node.value.type ) {
				rawClassName = node.value.expression;
			} else {
				rawClassName = node.value;
			}

			if ( 'Literal' !== rawClassName.type || 'string' !== typeof rawClassName.value ) {
				return;
			}

			const filename = context.getFilename();
			const isRootFile = isFolderRootFile( filename );
			const isRootElement = isRootElementInFile( node );

			// `null` return value indicates intent to abort validation
			if ( null === isRootElement ) {
				return;
			}

			const classNames = rawClassName.value.split( ' ' );
			const namespace = path.basename( path.dirname( filename ) );
			const prefixPattern = new RegExp( `^${ namespace }__[a-z0-9-]+$` );

			const isError = ! classNames.some( function( className ) {
				if ( isRootElement && isRootFile ) {
					return className === namespace;
				}

				// Non-root node should have class name starting with but not
				// equal to namespace prefix
				return prefixPattern.test( className );
			} );

			if ( ! isError ) {
				return;
			}

			expected = namespace;
			if ( ! ( isRootElement && isRootFile ) ) {
				expected += '__ prefix';
			}

			if ( isRootElement && ! isRootFile ) {
				expected += ` or to be in ${ rootFiles.length > 1 ? 'one of ' : '' }${ rootFiles.join(
					', '
				) }`;
			}

			context.report( {
				node: node,
				message: rule.ERROR_MESSAGE,
				data: { expected },
			} );
		},
	};
} );

rule.ERROR_MESSAGE = 'className should follow CSS namespace guidelines (expected {{expected}})';
rule.DEFAULT_ROOT_FILES = [ 'index.js', 'index.jsx' ];

rule.schema = [
	{
		type: 'object',
		properties: {
			rootFiles: {
				type: 'array',
				minItems: 1,
				items: {
					type: 'string',
				},
			},
		},
		additionalProperties: false,
	},
];
