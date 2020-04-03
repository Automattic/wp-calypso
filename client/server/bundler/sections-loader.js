/**
 * External dependencies
 */
const { getOptions } = require( 'loader-utils' ); // eslint-disable-line import/no-extraneous-dependencies

/*
 * This sections-loader has one responsibility: adding import statements for the section modules.
 *
 * It takes in a list of sections, and then for each one adds in a new key to the json
 * 'load'. The value for 'load' is a fn that returns the entry point for a section. (or a promise for the entry point)
 *
 * The exact import syntax used depends on the `useRequire` parameter. If `true`, synchronous `require`
 * expressions are used. That's needed for server. If `useRequire` is `false`, a dynamic (promise-returning)
 * `import()` expression is generated. That's useful for the code-splitting browser bundle.
 */
function addModuleImportToSections( sections, { useRequire, onlyIsomorphic } = {} ) {
	sections.forEach( section => {
		if ( onlyIsomorphic && ! section.isomorphic ) {
			// don't generate an import statement for the section (that will prevent its code from being
			// bundle), but don't remove the section from the list.
			return;
		}

		section.load = useRequire
			? `() => require( '${ section.module }' )`
			: `() => import( /* webpackChunkName: '${ section.name }' */ '${ section.module }' )`;
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

const loader = function() {
	const options = getOptions( this ) || {};
	const { useRequire, onlyIsomorphic } = options;
	let { include } = options;

	let sections = require( this.resourcePath );

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

	return addModuleImportToSections( sections, { useRequire, onlyIsomorphic } );
};

loader.addModuleImportToSections = addModuleImportToSections;

module.exports = loader;
