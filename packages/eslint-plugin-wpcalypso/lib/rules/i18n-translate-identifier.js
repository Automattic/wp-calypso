/**
 * @file Disallow declaring variables with unexpected identifier names referring to translation functions.
 * @author Automattic
 * @copyright 2023 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

const I18N_CALYPSO_TRANSLATE_FUNCTION = 'translate';
const WP_I18N_TRANSLATE_FUNCTIONS = new Set( [ '__', '_n', '_nx', '_x' ] );

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

const getCallee = require( '../util/get-callee' );

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule = ( module.exports = function ( context ) {
	return {
		CallExpression: function ( node ) {
			// Check for variable declaration with `useTranslate` from i18n-calypso.
			if (
				getCallee( node ).name === 'useTranslate' &&
				node.parent &&
				node.parent.type === 'VariableDeclarator' &&
				node.parent.id &&
				node.parent.id.name !== I18N_CALYPSO_TRANSLATE_FUNCTION
			) {
				context.report( {
					node: node.parent.id,
					message: rule.ERROR_MESSAGE,
					data: {
						translateFnName: I18N_CALYPSO_TRANSLATE_FUNCTION,
					},
				} );
			}

			// Check for variable declaration with `useI18n` from @wordpress/react-i18n.
			if (
				getCallee( node ).name === 'useI18n' &&
				node.parent &&
				node.parent.type === 'VariableDeclarator' &&
				node.parent.id &&
				node.parent.id.type === 'ObjectPattern'
			) {
				node.parent.id.properties.forEach( ( property ) => {
					if (
						! WP_I18N_TRANSLATE_FUNCTIONS.has( property.key.name ) ||
						property.key.name === property.value.name
					) {
						return;
					}

					context.report( {
						node: property,
						message: rule.ERROR_MESSAGE,
						data: {
							translateFnName: property.key.name,
						},
					} );
				} );
			}
		},
	};
} );

rule.ERROR_MESSAGE =
	'Variable identifier should be named `{{translateFnName}}` in order to be properly detected by the string extraction tools';

rule.schema = [];
