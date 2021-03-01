/**
 * @file Ensure JSX className adheres to CSS namespace guidelines
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

const rule = ( module.exports = function ( context ) {
	const rootFiles = ( context.options[ 0 ] || {} ).rootFiles || rule.DEFAULT_ROOT_FILES;

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

	function isFolderRootFile( filename ) {
		return rootFiles.indexOf( path.basename( filename ) ) !== -1;
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

			const filename = context.getFilename();

			const namespaces = [ path.basename( path.dirname( filename ) ) ];
			if ( ! isFolderRootFile( filename ) ) {
				namespaces.push( path.basename( filename, path.extname( filename ) ) );
			}

			const prefixPatterns = namespaces.map(
				( namespace ) => new RegExp( `^${ namespace }(__[a-z0-9-]+)?$` )
			);

			const classNames = rawClassName.value.split( ' ' );
			const isError = ! classNames.some( ( className ) =>
				prefixPatterns.some( ( prefixPattern ) => prefixPattern.test( className ) )
			);

			if ( ! isError ) {
				return;
			}

			const expected =
				namespaces.map( ( namespace ) => namespace + '__' ).join( ' or ' ) + ' prefix';

			context.report( {
				node,
				message: rule.ERROR_MESSAGE,
				data: { expected },
			} );
		},
	};
} );

rule.ERROR_MESSAGE = 'className should follow CSS namespace guidelines (expected {{expected}})';
rule.DEFAULT_ROOT_FILES = [
	'index.js',
	'index.jsx',
	'index.ts',
	'index.tsx',
	// Storybook files
	'index.stories.js',
	'index.stories.jsx',
];

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
