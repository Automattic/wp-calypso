/**
 * Node dependencies
 */
const fs = require( 'fs' );

/**
 * External dependencies
 */
const { last } = require( 'lodash' );
const espree = require( 'espree' );
const doctrine = require( 'doctrine' );

module.exports = function( config ) {
	const result = {};
	Object.entries( config ).forEach( ( [ namespace, namespaceConfig ] ) => {
		const namespaceResult = {
			name: namespace,
			title: namespaceConfig.title,
			selectors: [],
			actions: [],
		};

		[ 'selectors', 'actions' ].forEach( ( type ) => {
			namespaceConfig[ type ].forEach( ( file ) => {
				const code = fs.readFileSync( file, 'utf8' );
				const parsedCode = espree.parse( code, {
					attachComment: true,
					// This should ideally match our babel config, but espree doesn't support it.
					ecmaVersion: 9,
					sourceType: 'module',
				} );

				parsedCode.body.forEach( ( node ) => {
					if (
						node.type === 'ExportNamedDeclaration' &&
						node.declaration.type === 'FunctionDeclaration' &&
						node.leadingComments &&
						node.leadingComments.length !== 0
					) {
						const docBlock = doctrine.parse(
							last( node.leadingComments ).value,
							{ unwrap: true, recoverable: true }
						);
						const func = {
							name: node.declaration.id.name,
							description: docBlock.description,
							params: docBlock.tags.filter( ( tag ) => tag.title === 'param' ),
							return: docBlock.tags.find( ( tag ) => tag.title === 'return' ),
						};

						namespaceResult[ type ].push( func );
					}
				} );
			} );
		} );

		result[ namespace ] = namespaceResult;
	} );

	return result;
};
