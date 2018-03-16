/** @format */

const types = require( '@babel/types' );

module.exports = function() {
	return {
		visitor: {
			ImportDeclaration( path ) {
				const { source } = path.node;

				// Transform any import from 'lodash-es' (exact match, no submodule) to 'lodash'
				const fullMatch = source.value.match( /^lodash-es$/ );
				if ( fullMatch ) {
					source.value = 'lodash';
					return;
				}

				// Transform default import from a 'lodash-es' submodule to a a named import from 'lodash'
				// Example:
				// In: import theGet from 'lodash-es/get'
				// Out: import { get as theGet } from 'lodash'
				const subMatch = source.value.match( /^lodash-es\/(.*)/ );
				if ( subMatch ) {
					const { specifiers } = path.node;
					// If there is anything else than a single default import, throw an error. Such an
					// import is not valid. Example: import { get } from 'lodash-es/get'
					// There is only the default export in 'lodash-es/get' and no named one.
					if (
						! specifiers ||
						specifiers.length !== 1 ||
						specifiers[ 0 ].type !== 'ImportDefaultSpecifier'
					) {
						throw path.buildCodeFrameError(
							'babel-lodash-es: Could not transform a non-default import from lodash-es/submodule'
						);
					}

					// Transforms
					//  `import theGet from 'lodash-es/get'`
					// to
					//  `import { get as theGet } from 'lodash'`
					const localIdentifier = specifiers[ 0 ].local;
					const importedIdentifier = types.identifier( subMatch[ 1 ] );
					const specifier = types.importSpecifier( localIdentifier, importedIdentifier );
					const declaration = types.importDeclaration(
						[ specifier ],
						types.stringLiteral( 'lodash' )
					);
					path.replaceWith( declaration );
				}
			},
		},
	};
};
