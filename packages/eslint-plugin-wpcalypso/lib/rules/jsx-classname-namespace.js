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
// Constants
//------------------------------------------------------------------------------

var REGEXP_INDEX_PATH = /(\\|\/)index\.jsx?$/;

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

	function isRenderCallExpression( node ) {
		var calleeName;
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
		return -1 !== [
			'FunctionExpression',
			'FunctionDeclaration',
			'ArrowFunctionExpression'
		].indexOf( node.type );
	}

	function isRootRenderedElement( node, filename ) {
		var parent = node.parent.parent,
			functionExpression, functionName, isRoot;

		if ( ! REGEXP_INDEX_PATH.test( filename ) ) {
			return false;
		}

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
						if ( 'ExportDefaultDeclaration' === parent.parent.type ||
								isModuleExportNode( parent.parent ) ) {
							isRoot = true;
						}
						break;

					case 'FunctionExpression':
						if ( 'AssignmentExpression' === parent.parent.type &&
								isModuleExportNode( parent.parent.parent ) ) {
							isRoot = true;
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

				isRoot = !! functionName && parent.body.some( function( programNode ) {
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
			var rawClassName, filename, isRoot, classNames, namespace, prefix,
				isError, expected;

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

			filename = context.getFilename();
			isRoot = isRootRenderedElement( node, filename );

			// `null` return value indicates intent to abort validation
			if ( null === isRoot ) {
				return;
			}

			classNames = rawClassName.value.split( ' ' );
			namespace = path.basename( path.dirname( filename ) );
			prefix = namespace + '__';

			isError = ! classNames.some( function( className ) {
				if ( isRoot ) {
					return className === namespace;
				}

				// Non-root node should have class name starting with but not
				// equal to namespace prefix
				return (
					0 === className.indexOf( prefix ) &&
					className !== prefix
				);
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
