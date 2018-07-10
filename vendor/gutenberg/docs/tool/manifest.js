/**
 * Node dependencies
 */
const { kebabCase } = require( 'lodash' );

/**
 * Generates the manifest for the given namespaces.
 *
 * @param {Object} parsedNamespaces Parsed Namespace Object.
 * @param {Object} packagesConfig   Packages Docs Config.
 *
 * @return {Array} manifest.
 */
module.exports = function( parsedNamespaces, packagesConfig ) {
	const dataManifest = [ {
		title: 'Data Package Reference',
		slug: 'data',
		markdown_source: 'https://raw.githubusercontent.com/WordPress/gutenberg/master/docs/data/README.md',
		parent: null,
	} ].concat(
		Object.values( parsedNamespaces ).map( ( parsedNamespace ) => {
			const slug = `data-${ kebabCase( parsedNamespace.name ) }`;
			return {
				title: parsedNamespace.title,
				slug,
				markdown_source: `https://raw.githubusercontent.com/WordPress/gutenberg/master/docs/data/${ slug }.md`,
				parent: 'data',
			};
		} )
	);

	const packagesManifest = Object.entries( packagesConfig ).map( ( [ folderName, config ] ) => {
		const path = config.isNpmReady === false ?
			`https://raw.githubusercontent.com/WordPress/gutenberg/master/${ folderName }/README.md` :
			`https://raw.githubusercontent.com/WordPress/gutenberg/master/packages/${ folderName }/README.md`;
		return {
			title: `@wordpress/${ folderName }`,
			slug: `packages-${ folderName }`,
			markdown_source: path,
			parent: 'packages',
		};
	} );

	return packagesManifest.concat( dataManifest );
};
