/** @format */
/**
 * @fileoverview Enforce external, internal dependencies docblocks
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const ERROR_MESSAGE = 'Missing external, internal dependencies docblocks';
const RX_DOCBLOCK = /\/\*\*\n \* (Ex|In)ternal dependencies\s*\n \*\//i;

module.exports = {
	meta: {
		docs: {
			description: 'Enforce external, internal dependencies docblocks',
			category: 'Stylistic Issues',
		},
	},
	create( context ) {
		let hasIssue = false;

		return {
			ImportDeclaration() {
				hasIssue = hasIssue || ! RX_DOCBLOCK.test( context.getSourceCode().text );
			},
			'Program:exit'( node ) {
				if ( hasIssue ) {
					context.report( node, ERROR_MESSAGE );
				}
			},
		};
	},
};
