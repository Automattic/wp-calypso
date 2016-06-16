/**
 * @fileoverview Ensure JSX className adheres to CSS namespace guidelines
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var path = require( 'path' );

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

var rule = module.exports = function( context ) {
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

	function isRootRenderedElement( node ) {
		var parent = node.parent.parent.parent,
			functionExpression, functionName;

		// If wrapped in a JSX element, the node is a child
		if ( 'JSXElement' === parent.type ) {
			return false;
		}

		do {
			if ( -1 !== [ 'FunctionExpression', 'FunctionDeclaration', 'ArrowFunctionExpression' ].indexOf( parent.type ) ) {
				functionExpression = parent;

				// If inside function expression, check that the name of the
				// property is "render" (React.createClass or Component class)
				if ( isRenderFunction( parent ) ) {
					return true;
				}

				// If wrapped in function declaration, check the declaration
				// is part of a default export (stateless function component)
				switch ( parent.type ) {
					case 'ArrowFunctionExpression':
					case 'FunctionDeclaration':
						if ( 'ExportDefaultDeclaration' === parent.parent.type ||
								isModuleExportNode( parent.parent ) ) {
							return true;
						}
						break;

					case 'FunctionExpression':
						if ( 'AssignmentExpression' === parent.parent.type &&
								isModuleExportNode( parent.parent.parent ) ) {
							return true;
						}
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

				return !! functionName && parent.body.some( function( programNode ) {
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

			parent = parent.parent;
		} while ( parent );

		return false;
	}

	return {
		JSXAttribute: function( node ) {
			var rawClassName, classNames, isError, isRoot, namespace, expected;

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

			classNames = rawClassName.value.split( ' ' );
			namespace = path.basename( path.dirname( context.getFilename() ) );
			isRoot = isRootRenderedElement( node );
			isError = ! classNames.some( function( className ) {
				if ( isRoot ) {
					return className === namespace;
				}

				return 0 === className.indexOf( namespace + '__' );
			} );

			if ( ! isError ) {
				return;
			}

			expected = namespace;
			if ( ! isRoot ) {
				expected += '__ prefix';
			}

			context.report( {
				node: node,
				message: rule.ERROR_MESSAGE,
				data: {
					expected: expected
				}
			} );
		}
	};
};

rule.ERROR_MESSAGE = 'className should follow CSS namespace guidelines (expected {{expected}})';

rule.schema = [];
