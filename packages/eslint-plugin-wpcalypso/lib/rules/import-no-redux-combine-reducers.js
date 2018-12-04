/** @format */
/**
 * @fileoverview Disallow combineReducers import from redux
 * @author Automattic
 * @copyright 2017 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const ERROR_MESSAGE = 'combineReducers should be imported from state/utils not redux';

module.exports = {
	meta: {
		docs: {
			description: 'Disallow combineReducers import from redux',
			category: 'Possible Errors',
		},
	},
	create( context ) {
		return {
			ImportDeclaration( node ) {
				if ( node.source.value === 'redux' ) {
					const hasCombineReducersFromRedux = node.specifiers.some(
						specifier => specifier.imported.name === 'combineReducers'
					);
					if ( hasCombineReducersFromRedux ) {
						context.report( node, ERROR_MESSAGE );
					}
				}
			},
		};
	},
};
