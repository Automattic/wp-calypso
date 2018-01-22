/** @format */

/**
 * Inlines Redux action type constants with their string value
 * Babel Transform
 *
 * We use named constants for our Redux action types for a number
 * of reasons that aid our ability to manage and understand these
 * actions. The constants help us find uses of a given action type
 * and they limit the effect of action type typos because a type
 * which is improperly written will result in an import error
 * instead of a valid-but-useless string.
 *
 * However, none of this information is helpful or valuable to our
 * customers after the bundle has been build. The values of the
 * constants are meaningless in essence though they can be useful
 * for debugging if they match something searchable in our code.
 * Mostly the constants add bloat to the bundle without value.
 *
 * This transform replaces those constants with their string
 * values directly, inlining those values, in order to eliminate
 * our need to ship the "action type dictionary" mapping the
 * constants with their values.
 *
 * @example
 *   Input:
 *     import { INCREMENT as INC, RESET } from 'state/action-types';
 *
 *     if ( INC === type ) { return state + 1 }
 *     if ( RESET === type ) { return 0 }
 *
 *   Output:
 *     // no more import statement
 *
 *     if ( 'INCREMENT' === type ) { return state + 1 }
 *     if ( 'RESET' === type ) { return 0 }
 *
 * We can note a few important points:
 *   - This inlines the actual constant name, not the imported-as name
 *   - It ultimately doesn't matter what the values are as long as they
 *     are unique. We have less risk of bugs occurring as a result of
 *     action type clashes after this transform than we do before because
 *     our imports are constrained to be unique while the string values
 *     of our action types aren't.
 *   - The end result of this transform is the elimination of the
 *   ` `state/action-types` module from the final output bundle.
 *
 * @param {Object} babel exposed Babel API
 * @returns {Object} the Babel transformer
 */
function transformIt( babel ) {
	const { types: t } = babel;

	const replacer = {
		Identifier( path ) {
			// we haven't deleted the `import` statement yet
			// so if we don't skip it then we'll enter a cycle
			if ( t.isImportSpecifier( path.parentPath ) ) {
				return path.skip();
			}

			const name = path.node.name;
			if ( ! this.myTypes.hasOwnProperty( name ) ) {
				return path.skip();
			}

			path.replaceWith( t.stringLiteral( this.myTypes[ name ] ) );
		},
	};

	const mergeImports = ( o, n ) => {
		o[ n.local.name ] = n.imported.name;
		return o;
	};

	return {
		name: 'action-type-inliner',
		visitor: {
			ImportDeclaration( path ) {
				// import … from '{ path.node.source.value }'
				const name = path.node.source.value;

				// this is a very-specific transform because
				// we don't want to mess up other imports
				if ( name !== 'state/action-types' ) {
					return path.skip();
				}

				const myTypes = path.node.specifiers
					.filter( t.isImportSpecifier )
					.reduce( mergeImports, {} );

				path.parentPath.traverse( replacer, { myTypes } );

				// and remove the `import` statement after we have
				// made our replacements in the module
				path.remove();
			},
		},
	};
}

module.exports = transformIt;
