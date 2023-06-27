/**
 * @file Disallow using unlocalized URL strings
 * @author Automattic
 * @copyright 2023 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

const LOCALIZABLE_URLS = [
	'apps.wordpress.com',
	'automattic.com/cookies(/|$)',
	'automattic.com/privacy(/|$)',
	'wordpress.com/blog(/|$)',
	'wordpress.com/forums(/|$)',
	'wordpress.com/go(/|$)',
	'wordpress.com/support(/|$)',
	'wordpress.com/tos(/|$)',
];

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

const getCallee = require( '../util/get-callee' );

/**
 * Check whether the provided string is localizable string.
 *
 * @param   {string}  string String to be tested
 * @returns {boolean}
 */
function isLocalizableUrlString( string ) {
	return LOCALIZABLE_URLS.some( ( url ) =>
		new RegExp( `^(https?:)?//${ url.replace( '.', '\\.' ) }`, 'i' ).test( string )
	);
}

/**
 * Check whether the provided node type is variable declarator.
 *
 * @param   {string}  type Node type
 * @returns {boolean}
 */
function isVariableDeclarationValue( type ) {
	return type === 'VariableDeclarator';
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule = ( module.exports = function ( context ) {
	const variableDeclarationValues = [];
	const urlVariables = new Set();

	/**
	 * Check whether the node is unlocalized url.
	 *
	 * @param   {Object} node
	 * @param   {string} nodeValueString
	 * @returns {void}
	 */
	function handleUnlocalizedUrls( node, nodeValueString ) {
		// Node is wrapped in localizeUrl, therefore we can assume it's localized and we don't need to do any further checks.
		if ( getCallee( node.parent ).name === 'localizeUrl' ) {
			return;
		}

		// Check whether the string value of the node is localizable string.
		if ( ! isLocalizableUrlString( nodeValueString ) ) {
			return;
		}

		// Url string is assigned to a variable and variable is possibly later used in a localizeUrl call;
		if ( isVariableDeclarationValue( node.parent.type ) ) {
			variableDeclarationValues.push( node );
		} else {
			// Report unlocalized url.
			context.report( {
				node,
				message: rule.ERROR_MESSAGE,
			} );
		}
	}

	return {
		'Program:exit': function () {
			for ( const node of variableDeclarationValues ) {
				if ( ! urlVariables.has( node.parent?.id?.name ) ) {
					// Report unlocalized url.
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
			handleUnlocalizedUrls( node, node.value );
		},
		TemplateElement: function ( node ) {
			const templateLiteralNode = node.parent;
			handleUnlocalizedUrls( templateLiteralNode, node.value.raw );
		},
	};
} );

rule.ERROR_MESSAGE = "Url string should be wrapped in 'localizeUrl' function call";

rule.schema = [];
