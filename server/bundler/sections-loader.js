/** @format */
const config = require( 'config' );
const { getOptions } = require( 'loader-utils' );

/*
 * This sections-loader has one responsibility: adding import statements for the section modules.
 *
 * It takes in a list of sections, and then for each one adds in a new key to the json
 * 'load'. The value for 'load' is a fn that returns the entry point for a section. (or a promise for the entry point)
 * This needs to be done in a magic webpack loader in order to keep ability to easily switch code-splitting on and off.
 * If we ever wanted to get rid of this file we need to commit to either on or off and manually adding the load
 * functions to each section object.
 */
function addModuleImportToSections( { sections, shouldSplit, onlyIsomorphic } ) {
	sections.forEach( section => {
		if ( onlyIsomorphic && ! section.isomorphic ) {
			return;
		}

		const loaderFunction = `function() { return require( /* webpackChunkName: '${
			section.name
		}' */ '${ section.module }'); }`;

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

const loader = function() {
	const { forceRequire, onlyIsomorphic } = getOptions( this ) || {};
	const sections = require( this.resourcePath );

	return addModuleImportToSections( {
		sections,
		shouldSplit: config.isEnabled( 'code-splitting' ) && ! forceRequire,
		onlyIsomorphic,
	} );
};
loader.addModuleImportToSections = addModuleImportToSections;

module.exports = loader;
