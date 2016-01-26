/**
 * @fileoverview Disallow importing from the root Lodash module
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */
'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function( context ) {
	var ERROR_MESSAGE = 'Never import from root Lodash package';

	return {
		ImportDeclaration: function( node ) {
			if ( 'lodash' === node.source.value ) {
				context.report( node, ERROR_MESSAGE );
			}
		},

		CallExpression: function( node ) {
			if ( 'require' === node.callee.name && node.arguments.length > 0 &&
					'lodash' === node.arguments[ 0 ].value ) {
				context.report( node, ERROR_MESSAGE );
			}
		}
	};
};

module.exports.schema = [];
