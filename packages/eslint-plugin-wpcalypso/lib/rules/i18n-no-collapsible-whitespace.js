/**
 * @file Disallow collapsible whitespace in translatable strings.
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

const getCallee = require( '../util/get-callee' ),
	getTextContentFromNode = require( '../util/get-text-content-from-node' );

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule = ( module.exports = function ( context ) {
	return {
		CallExpression: function ( node ) {
			if ( 'translate' !== getCallee( node ).name ) {
				return;
			}

			node.arguments.forEach( function ( arg ) {
				const string = getTextContentFromNode( arg );
				let problem, problemString, problemsByCharCode;

				if ( ! string ) {
					return;
				}

				const collapsibleWhitespace = string.match( /(\n|\t|\r|(?: {2}))/ );

				if ( collapsibleWhitespace ) {
					problemsByCharCode = {
						9: '\\t',
						10: '\\n',
						13: '\\r',
						32: 'consecutive spaces',
					};
					problem = problemsByCharCode[ collapsibleWhitespace[ 0 ].charCodeAt( 0 ) ];
					problemString = problem ? ` (${ problem })` : '';
					context.report( {
						node: arg,
						message: rule.ERROR_MESSAGE,
						data: {
							problem: problemString,
						},
					} );
				}
			} );
		},
	};
} );

rule.ERROR_MESSAGE = 'Translations should not contain collapsible whitespace{{problem}}';

rule.schema = [];
