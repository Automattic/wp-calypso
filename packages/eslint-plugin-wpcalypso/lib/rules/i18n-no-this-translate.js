/**
 * @file Disallow the use of this.translate
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const ERROR_MESSAGE =
	'Use localize( ReactComponent ) instead of this.translate. See https://git.io/vSwRi';

module.exports = {
	meta: {
		docs: {
			description: 'Disallow the use of this.translate',
			category: 'Deprecation',
			recommended: true,
		},
		schema: [],
	},
	create: function ( context ) {
		return {
			CallExpression: function ( node ) {
				if (
					node.callee.type === 'MemberExpression' &&
					node.callee.object.type === 'ThisExpression' &&
					node.callee.property.name === 'translate'
				) {
					context.report( node, ERROR_MESSAGE );
				}
			},
		};
	},
};
