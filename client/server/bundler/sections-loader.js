/**
 * External dependecies
 */
const { getOptions } = require( 'loader-utils' ); // eslint-disable-line import/no-extraneous-dependencies

/**
 * Internal dependencies
 */
const config = require( '../config' );

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

function printSectionsAndPaths( sections ) {
	let lastSection = null;
	const sortedSections = [ ...sections ];
	sortedSections.sort( ( a, b ) => {
		return a.name.localeCompare( b.name );
	} );
	for ( const section of sortedSections ) {
		if ( lastSection !== section.name ) {
			console.log( `\t${ section.name }:` );
			lastSection = section.name;
		}
		for ( const p of section.paths ) {
			console.log( `\t\t${ p }` );
		}
	}
}

function filterSectionsInDevelopment( sections ) {
	const bundleEnv = config( 'env' );
	if ( 'development' !== bundleEnv ) {
		return sections;
	}

	const activeSections = config( 'sections' );
	const byDefaultEnableSection = config( 'enable_all_sections' );

	return sections.filter( section => {
		if ( activeSections && typeof activeSections[ section.name ] !== 'undefined' ) {
			return activeSections[ section.name ];
		}
		return byDefaultEnableSection;
	} );
}

const loader = function() {
	const options = getOptions( this ) || {};
	const { forceRequire, onlyIsomorphic } = options;
	let { include } = options;

	let sections = filterSectionsInDevelopment( require( this.resourcePath ) );

	if ( include ) {
		if ( ! Array.isArray( include ) ) {
			include = include.split( ',' );
		}
		console.log( `[sections-loader] Limiting build to ${ include.join( ', ' ) } sections` );
		const allSections = sections;
		sections = allSections.filter( section => include.includes( section.name ) );
		if ( ! sections.length ) {
			// nothing matched. warn.
			console.warn( `[sections-loader] No sections matched ${ include.join( ',' ) }` );
			console.warn( `[sections-loader] Available sections are:` );
			printSectionsAndPaths( allSections );
		}
	}

	return addModuleImportToSections( {
		sections,
		shouldSplit: config.isEnabled( 'code-splitting' ) && ! forceRequire,
		onlyIsomorphic,
	} );
};
loader.addModuleImportToSections = addModuleImportToSections;

module.exports = loader;
