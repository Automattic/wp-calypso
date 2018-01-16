/** @format */
const config = require( 'config' );
const utils = require( './utils' );

/*
 * This sections-loader has two one responsibilties: adding import statements and css details.
 *
 * It takes in a list of sections, and then for each one adds in a new key to the json
 * 'load'. The value for 'load' is a fn that returns the entry point for a section. (or a promise for the entry point)
 * This needs to be done in a magic webpack loader in order to keep ability to easily switch code-splitting on and off.
 * If we ever wanted to get rid of this file we need to commit to either on or off and manually adding the load
 * functions to each section object.
 *
 * It also searches for sections with a `css` key and adds in css filename corresponding to that css chunk id.
 * Technically this could happen as part of sections-middleware, but it relies upon nodejs crypto that would pull
 * in huge modules to the client, so for now its being done as part of the loader.
 */

function addModuleImportToSections( { sections, shouldSplit } ) {
	sections.forEach( section => {
		const loaderFunction = `function() { return require( /* webpackChunkName: '${ section.name }' */ '${ section.module }'); }`;

		section.load = shouldSplit ? loaderFunction.replace( 'require', 'import' ) : loaderFunction;
	} );

	// strip the outer quotation marks from the load statement
	const sectionStringsWithImportFns = JSON.stringify( sections, null, '\t' ).replace(
		/load": "(.*)"/g,
		'load": $1'
	);

	const sectionsFile = `module.exports = ${ sectionStringsWithImportFns }`;
	return sectionsFile;
}

function withCss( sections ) {
	return sections.map( section => ( {
		...section,
		...( section.css && {
			css: {
				id: section.css,
				urls: utils.getCssUrls( section.css ),
			},
		} ),
	} ) );
}

const loader = function() {
	const sections = require( this.resourcePath );

	return addModuleImportToSections( {
		sections: withCss( sections ),
		shouldSplit: config.isEnabled( 'code-splitting' ),
	} );
};
loader.addModuleImportToSections = addModuleImportToSections;
loader.withCss = withCss;

module.exports = loader;
