/**
 * @file Ensure JSX className adheres to BEM CSS naming conventions.
 * @author Automattic
 * @copyright 2022 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const namePattern = new RegExp( `^[a-z0-9-]+(__[a-z0-9-]+)?$` );

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule = ( module.exports = function ( context ) {
	function isRenderCallExpression( node ) {
		if ( 'CallExpression' !== node.type ) {
			return false;
		}

		let calleeName;
		if ( 'MemberExpression' === node.callee.type ) {
			calleeName = node.callee.property.name;
		} else if ( 'Identifier' === node.callee.type ) {
			calleeName = node.callee.name;
		}

		return calleeName && 'render' === calleeName;
	}

	function isInRenderCallExpession( node ) {
		for ( let parent = node; parent; parent = parent.parent ) {
			if ( isRenderCallExpression( parent ) ) {
				return true;
			}
		}

		return false;
	}

	return {
		JSXAttribute: function ( node ) {
			if ( 'className' !== node.name.name ) {
				return;
			}
			let rawClassName;
			if ( 'JSXExpressionContainer' === node.value.type ) {
				rawClassName = node.value.expression;
			} else {
				rawClassName = node.value;
			}
			if ( 'Literal' !== rawClassName.type || 'string' !== typeof rawClassName.value ) {
				return;
			}
			// we don't validate elements inside `ReactDOM.render` expressions
			if ( isInRenderCallExpession( node ) ) {
				return;
			}

			// Extract class names into an array.
			const classNames = rawClassName.value.split( ' ' );
			const isError = ! classNames.some( ( className ) => namePattern.test( className ) );
			if ( ! isError ) {
				return;
			}

			context.report( {
				node,
				message: rule.ERROR_MESSAGE,
			} );
		},
	};
} );

rule.ERROR_MESSAGE = 'className should adhere to BEM convention';

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
