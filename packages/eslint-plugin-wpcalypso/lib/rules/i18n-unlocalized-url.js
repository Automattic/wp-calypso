/**
 * @file @todo
 * @author Automattic
 * @copyright 2023 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

// @todo: should be replaced by url mapping from @automattic/i18n-calypso.
const LOCALIZABLE_URLS = [
	'apps.wordpress.com',
	'automattic.com/cookies(/|$)',
	'automattic.com/privacy(/|$)',
	'jetpack.com/?$',
	'wordpress.com/?$',
	'wordpress.com/blog(/|$)',
	'wordpress.com/forums(/|$)',
	'wordpress.com/go(/|$)',
	'wordpress.com/support(/|$)',
	'wordpress.com/theme(/|$)',
	'wordpress.com/themes(/|$)',
	'wordpress.com/tos(/|$)',
];

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

const getCallee = require( '../util/get-callee' );

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule = ( module.exports = function ( context ) {
	const variableDeclarationValues = [];
	const urlVariables = new Set();

	return {
		'Program:exit': function () {
			for ( const node of variableDeclarationValues ) {
				if ( ! urlVariables.has( node.parent?.id?.name ) ) {
					context.report( {
						node,
						message: rule.ERROR_MESSAGE,
					} );
				}
			}
		},
		CallExpression: function ( node ) {
			const callee = getCallee( node );
			if (
				callee !== node &&
				callee.name === 'localizeUrl' &&
				node.arguments?.[ 0 ]?.type === 'Identifier'
			) {
				urlVariables.add( node.arguments[ 0 ]?.name );
			}
		},
		Literal: function ( node ) {
			// String is wrapped in localizeUrl, therefore we can assume it's localized and we don't need to do any further checks.
			if ( getCallee( node.parent ).name === 'localizeUrl' ) {
				return;
			}

			const isLocalizableUrlString = LOCALIZABLE_URLS.some( ( url ) =>
				new RegExp( `^(https?:)?//${ url.replace( '.', '\\.' ) }`, 'i' ).test( node.value )
			);

			// Url string is assigned to a variable and variable is later used in a localizeUrl call;
			const isVariableDeclarationValue = node.parent.type === 'VariableDeclarator';

			if ( isLocalizableUrlString && isVariableDeclarationValue ) {
				variableDeclarationValues.push( node );
			}

			if ( isLocalizableUrlString && ! isVariableDeclarationValue ) {
				context.report( {
					node,
					message: rule.ERROR_MESSAGE,
				} );
			}
		},
		TemplateElement: function ( node ) {
			// Template literal is wrapped in localizeUrl, therefore we can assume it's localized and we don't need to do any further checks.
			const templateLiteralNode = node.parent;
			if ( getCallee( templateLiteralNode.parent ).name === 'localizeUrl' ) {
				return;
			}

			const isLocalizableUrlString = LOCALIZABLE_URLS.some( ( url ) =>
				new RegExp( `^(https?:)?//${ url.replace( '.', '\\.' ) }`, 'i' ).test( node.value.raw )
			);

			// Url template string is assigned to a variable and variable is later used in a localizeUrl call;
			const isVariableDeclarationValue = templateLiteralNode.parent.type === 'VariableDeclarator';

			if ( isLocalizableUrlString && isVariableDeclarationValue ) {
				variableDeclarationValues.push( templateLiteralNode );
			}

			if ( isLocalizableUrlString && ! isVariableDeclarationValue ) {
				context.report( {
					node: templateLiteralNode,
					message: rule.ERROR_MESSAGE,
				} );
			}
		},
	};
} );

rule.ERROR_MESSAGE = "Url string should be wrapped in 'localizeUrl' function call";

rule.schema = [];
