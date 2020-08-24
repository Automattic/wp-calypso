/**
 * Replaces lodash modular imports with ES2015-style imports
 *
 * Note: this does not attempt to merge imports into existing
 *       'lodash' imports in the same module. This process
 *       should be handled in a separate codemod
 *
 * @example
 * // input
 * import _map from 'lodash/map';
 *
 * // output
 * import { map as _map } from 'lodash'
 *
 * @param file
 * @param api
 * @returns {string}
 */

export default function transformer( file, api ) {
	const j = api.jscodeshift;

	return j( file.source )
		.find( j.ImportDeclaration )
		.filter( ( dec ) => dec.value.source.value.startsWith( 'lodash/' ) )
		.replaceWith( ( node ) => {
			return Object.assign(
				j.importDeclaration(
					[
						j.importSpecifier(
							j.identifier( node.value.source.value.replace( 'lodash/', '' ) ),
							j.identifier( node.value.specifiers[ 0 ].local.name )
						),
					],
					j.literal( 'lodash' )
				),
				{
					comments: node.value.comments,
				}
			);
		} )
		.toSource();
}
